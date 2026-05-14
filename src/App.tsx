// src/App.tsx

import { useEffect, useRef, useState } from 'react';
import { getProfile, importCardmarket, type Profile } from './lib/api';
import { AuthError, isAuthenticated, signIn, signOut } from './lib/auth';
import { findCMTab, focusCMTab } from './lib/cmTab';
import { DEV_DEFAULTS, DEV_TOOLS, FAKE_ARTICLES, type DevOptions } from './lib/dev';
import { setStatusDot } from './lib/icon';
import { inlineDetect } from './lib/inlineDetect';
import { inlineScan } from './lib/inlineScan';
import { sanitizeArticle } from './lib/sanitize';
import { getSettings, SETTINGS_DEFAULTS, type Settings } from './lib/settings';
import type { DetectResult, ScannedArticle, ScanProgress } from './lib/types';
import { PopupShell } from './popup/PopupShell';
import { Button } from './popup/components/Button';
import { StateAuth } from './popup/states/StateAuth';
import { StateComplete, StateCompleteFooter } from './popup/states/StateComplete';
import { StateDetect, StateDetectFooter } from './popup/states/StateDetect';
import { StateScanning, StateScanningFooter } from './popup/states/StateScanning';

type FlowState = 'detect' | 'scanning' | 'complete';
type BootState = 'checking' | 'unauthenticated' | 'authenticated';
type PushState = 'idle' | 'pushing' | 'pushed' | 'error';
type Checkpoint = { page: number; totalPages: number | null; articleCount: number };

const CHECKPOINT_KEY = 'deckswap:scan_checkpoint';
const SCAN_RESULT_KEY = 'deckswap:scan_result';

function App() {
    // ── Boot / auth ──────────────────────────────────────────────────────────
    const [boot, setBoot] = useState<BootState>('checking');
    const [profile, setProfile] = useState<Profile | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    // ── Detection ────────────────────────────────────────────────────────────
    const [detectResult, setDetectResult] = useState<DetectResult | null>(null);
    const [detectKey, setDetectKey] = useState(0);
    const [settings, setSettings] = useState<Settings>(SETTINGS_DEFAULTS);

    // ── Scan ─────────────────────────────────────────────────────────────────
    const [flow, setFlow] = useState<FlowState>('detect');
    const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
    const [scanResult, setScanResult] = useState<ScannedArticle[] | null>(null);
    const [scanStartTime, setScanStartTime] = useState(0);
    const [scanElapsed, setScanElapsed] = useState(0);
    const [scanSavedAt, setScanSavedAt] = useState<number | null>(null);
    const [scanInterrupted, setScanInterrupted] = useState(false);
    const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
    const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(null);
    const [pushState, setPushState] = useState<PushState>('idle');

    const scanStartRef = useRef(0);
    const scanTabRef = useRef<number | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Dev ──────────────────────────────────────────────────────────────────
    const [devOptions, setDevOptions] = useState<DevOptions>(DEV_DEFAULTS);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const stopPoll = () => {
        if (pollRef.current != null) { clearInterval(pollRef.current); pollRef.current = null; }
    };

    const restoreCheckpoint = async () => {
        const stored = await chrome.storage.local.get(CHECKPOINT_KEY);
        const cp = stored[CHECKPOINT_KEY];
        if (cp?.page > 1) {
            setCheckpoint({ page: cp.page, totalPages: cp.totalPages ?? null, articleCount: cp.articleCount ?? 0 });
        }
    };

    // ── Effects ──────────────────────────────────────────────────────────────

    // Boot: restore auth state and any previously completed scan
    useEffect(() => {
        getSettings().then(setSettings);
        Promise.all([
            isAuthenticated(),
            chrome.storage.local.get(SCAN_RESULT_KEY),
        ]).then(([auth, stored]) => {
            if (auth) {
                const saved = stored[SCAN_RESULT_KEY];
                if (Array.isArray(saved?.articles) && saved.articles.length > 0) {
                    setScanResult(saved.articles);
                    setScanElapsed(saved.elapsedSeconds ?? 0);
                    setScanSavedAt(saved.savedAt ?? null);
                    setFlow('complete');
                }
            }
            setBoot(auth ? 'authenticated' : 'unauthenticated');
        });
    }, []);

    // Re-detect when the side panel is restored from bfcache
    useEffect(() => {
        const handler = (e: PageTransitionEvent) => { if (e.persisted) setDetectKey((k) => k + 1); };
        window.addEventListener('pageshow', handler);
        return () => window.removeEventListener('pageshow', handler);
    }, []);

    // Auto-retry detect when the user logs in to Cardmarket in another tab
    useEffect(() => {
        if (boot !== 'authenticated') return;
        const handler = (msg: { type: string }) => {
            if (msg.type !== 'cm-tab-loaded') return;
            const isNotLoggedIn = detectResult !== null && !detectResult.onStockPage && detectResult.reason === 'not-logged-in';
            if (flow === 'detect' && isNotLoggedIn) setDetectKey((k) => k + 1);
        };
        chrome.runtime.onMessage.addListener(handler);
        return () => chrome.runtime.onMessage.removeListener(handler);
    }, [boot, flow, detectResult]);

    // Fetch Deckswap profile
    useEffect(() => {
        if (boot !== 'authenticated') return;
        getProfile().then(setProfile).catch((err) => console.warn('Failed to load profile:', err));
    }, [boot]);

    // Detect Cardmarket stock
    useEffect(() => {
        if (boot !== 'authenticated') return;
        setDetectResult(null);

        if (DEV_TOOLS && devOptions.detectOverride !== 'real') {
            setDetectResult(
                devOptions.detectOverride === 'detected'
                    ? { onStockPage: true, articleCount: 80, username: 'dev-user', locale: 'en' }
                    : { onStockPage: false, reason: devOptions.detectOverride },
            );
            return;
        }

        (async () => {
            const hasPermission = await chrome.permissions.contains({ origins: ['https://www.cardmarket.com/*'] });
            if (!hasPermission) {
                setDetectResult({ onStockPage: false, reason: 'no-permission' });
                return;
            }

            const tabId = await findCMTab(settings.autoOpenCmTab);
            if (tabId == null) { setDetectResult({ onStockPage: false, reason: 'no-cm-tab' }); return; }

            try {
                const results = await chrome.scripting.executeScript({
                    target: { tabId },
                    func: inlineDetect,
                    args: [settings.locale],
                });
                const result = results[0]?.result as DetectResult | undefined;
                setDetectResult(result ?? { onStockPage: false, reason: 'fetch-error' });

                if (result?.onStockPage) {
                    const stored = await chrome.storage.local.get(CHECKPOINT_KEY);
                    const cp = stored[CHECKPOINT_KEY];
                    setCheckpoint(
                        cp?.locale === result.locale && cp.page > 1
                            ? { page: cp.page, totalPages: cp.totalPages ?? null, articleCount: cp.articleCount ?? 0 }
                            : null,
                    );
                } else {
                    setCheckpoint(null);
                }
            } catch (err) {
                const isPermissionError = err instanceof Error && err.message.toLowerCase().includes('permission');
                setDetectResult({ onStockPage: false, reason: isPermissionError ? 'no-permission' : 'fetch-error' });
            }
        })();
    }, [boot, detectKey, devOptions.detectOverride]);

    // Status dot on the extension icon
    useEffect(() => {
        if (flow === 'scanning') {
            setStatusDot('#F59E0B');
        } else if (flow === 'complete') {
            setStatusDot('#22C87A');
        } else {
            const isError = detectResult !== null && !detectResult.onStockPage;
            setStatusDot(isError ? '#EF4444' : null);
        }
    }, [flow, detectResult]);

    // ── Auth ─────────────────────────────────────────────────────────────────

    const canSubmitAuth = email.length > 0 && password.length > 0 && !submitting;

    const handleSignIn = async () => {
        if (!canSubmitAuth) return;
        setSubmitting(true);
        setAuthError(null);
        try {
            await signIn(email, password);
            setEmail('');
            setPassword('');
            setBoot('authenticated');
        } catch (err) {
            setAuthError(err instanceof AuthError ? err.message : 'Something went wrong. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        stopPoll();
        setProfile(null);
        setDetectResult(null);
        setScanProgress(null);
        setScanResult(null);
        setBoot('unauthenticated');
        setFlow('detect');
    };

    // ── Scan ─────────────────────────────────────────────────────────────────

    const handleStartScan = async (resume = false) => {
        if (!detectResult?.onStockPage) return;
        const tabId = await findCMTab();
        if (tabId == null) return;

        await chrome.storage.local.remove(SCAN_RESULT_KEY);
        if (!resume) await chrome.storage.local.remove(CHECKPOINT_KEY);

        const start = Date.now();
        scanStartRef.current = start;
        scanTabRef.current = tabId;
        setScanProgress(null);
        setScanResult(null);
        setScanStartTime(start);
        setRateLimitSeconds(0);
        setCheckpoint(null);
        setScanInterrupted(false);
        setFlow('scanning');

        await chrome.scripting.executeScript({
            target: { tabId },
            func: () => { (window as any).__deckswap_cancel = false; },
            args: [],
        });

        chrome.scripting.executeScript({
            target: { tabId },
            func: inlineScan,
            args: [{
                locale: detectResult.locale,
                speed: settings.scanSpeed,
                devOptions: DEV_TOOLS ? devOptions : undefined,
                resumeFrom: resume && checkpoint ? checkpoint.page : undefined,
                checkpointKey: CHECKPOINT_KEY,
            }],
        }).then(async (results) => {
            stopPoll();
            const raw = results[0]?.result as Array<Record<string, unknown>> | undefined;
            const articles = raw
                ?.map(sanitizeArticle)
                .filter((a): a is ScannedArticle => a !== null);
            if (Array.isArray(articles) && articles.length > 0) {
                const elapsed = Math.round((Date.now() - scanStartRef.current) / 1000);
                const savedAt = Date.now();
                await chrome.storage.local.set({ [SCAN_RESULT_KEY]: { articles, elapsedSeconds: elapsed, savedAt } });
                setScanElapsed(elapsed);
                setScanSavedAt(savedAt);
                setScanResult(articles);
                setFlow('complete');
                if (settings.notifyOnComplete) {
                    chrome.notifications.create('deckswap-scan-complete', {
                        type: 'basic',
                        iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
                        title: 'Scan complete',
                        message: `${articles.length.toLocaleString('en')} articles scanned and ready to push to Deckswap.`,
                    });
                }
            } else {
                setDetectResult({ onStockPage: false, reason: 'no-articles' });
                setFlow('detect');
            }
        }).catch(async (err) => {
            stopPoll();
            console.error('Scan failed:', err);
            await restoreCheckpoint();
            setScanInterrupted(true);
            setFlow('detect');
        });

        pollRef.current = setInterval(async () => {
            const tid = scanTabRef.current;
            if (tid == null) return;
            try {
                const [prog, rl] = await Promise.all([
                    chrome.scripting.executeScript({ target: { tabId: tid }, func: () => (window as any).__deckswap_progress ?? null, args: [] }),
                    chrome.scripting.executeScript({ target: { tabId: tid }, func: () => (window as any).__deckswap_rateLimit ?? 0, args: [] }),
                ]);
                if (prog[0]?.result) setScanProgress(prog[0].result as ScanProgress);
                setRateLimitSeconds((rl[0]?.result as number) ?? 0);
            } catch { /* tab closed or busy */ }
        }, 800);
    };

    const handleCancel = async () => {
        stopPoll();
        const tid = scanTabRef.current;
        if (tid != null) {
            chrome.scripting.executeScript({
                target: { tabId: tid },
                func: () => { (window as any).__deckswap_cancel = true; },
                args: [],
            }).catch(() => {});
        }
        scanTabRef.current = null;
        await restoreCheckpoint();
        setFlow('detect');
    };

    const handlePush = async () => {
        if (!scanResult || pushState === 'pushing') return;
        setPushState('pushing');
        try {
            await importCardmarket(scanResult);
            setPushState('pushed');
        } catch (err) {
            console.error('Push failed:', err);
            setPushState('error');
        }
    };

    const handleScanAgain = () => {
        chrome.storage.local.remove(SCAN_RESULT_KEY);
        setScanResult(null);
        setScanSavedAt(null);
        setPushState('idle');
        setFlow('detect');
    };

    // ── Dev shortcuts ─────────────────────────────────────────────────────────

    const handleDevJumpToScanning = () => {
        setScanProgress(null);
        setScanResult(null);
        const start = Date.now();
        scanStartRef.current = start;
        setScanStartTime(start);
        setFlow('scanning');
    };

    const handleDevJumpToComplete = () => {
        setScanResult(FAKE_ARTICLES);
        setScanElapsed(42);
        setFlow('complete');
    };

    // ── Render ────────────────────────────────────────────────────────────────

    if (boot === 'checking') {
        return (
            <PopupShell showConnection={false}>
                <div className="text-center py-8 text-[13px] text-ink-3">Loading…</div>
            </PopupShell>
        );
    }

    if (boot === 'unauthenticated') {
        return (
            <PopupShell
                showConnection={false}
                footer={
                    <Button block disabled={!canSubmitAuth} onClick={handleSignIn}>
                        {submitting ? 'Signing in…' : 'Sign in'}
                    </Button>
                }
            >
                <StateAuth
                    email={email}
                    password={password}
                    submitting={submitting}
                    error={authError}
                    onEmailChange={setEmail}
                    onPasswordChange={setPassword}
                    onSubmit={handleSignIn}
                />
            </PopupShell>
        );
    }

    const detectStatus: 'checking' | 'not-logged-in' | 'fetch-error' | 'rate-limited' | 'no-cm-tab' | 'no-articles' | 'no-permission' | 'detected' =
        detectResult === null ? 'checking' : detectResult.onStockPage ? 'detected' : detectResult.reason;

    const footer = (() => {
        if (flow === 'detect') {
            return (
                <StateDetectFooter
                    onStart={() => handleStartScan(false)}
                    onResume={() => handleStartScan(true)}
                    onRetry={() => { setScanInterrupted(false); setDetectKey((k) => k + 1); }}
                    detectStatus={detectStatus}
                    checkpoint={detectStatus === 'detected' ? checkpoint : null}
                    articleCount={detectResult?.onStockPage ? detectResult.articleCount : null}
                />
            );
        }
        if (flow === 'scanning') {
            return <StateScanningFooter onCancel={handleCancel} scanned={scanProgress?.scanned ?? 0} />;
        }
        if (flow === 'complete') {
            return (
                <StateCompleteFooter
                    onPush={handlePush}
                    onScanAgain={handleScanAgain}
                    articleCount={scanResult?.length ?? 0}
                    pushState={pushState}
                />
            );
        }
        return null;
    })();

    return (
        <PopupShell
            footer={footer}
            footerStack={flow === 'complete'}
            deckswapUsername={profile?.username ?? null}
            onSignOut={handleSignOut}
            onSettingsChange={setSettings}
            cardmarketUsername={detectResult?.onStockPage ? (detectResult.username ?? null) : null}
            devOptions={devOptions}
            onDevOptionsChange={setDevOptions}
            onDevJumpToScanning={handleDevJumpToScanning}
            onDevJumpToComplete={handleDevJumpToComplete}
        >
            {flow === 'detect' && (
                <StateDetect
                    status={detectStatus}
                    articleCount={detectResult?.onStockPage ? detectResult.articleCount : null}
                    onGoToCardmarket={detectStatus === 'not-logged-in' ? focusCMTab : undefined}
                    interrupted={scanInterrupted}
                    autoOpenCmTab={settings.autoOpenCmTab}
                />
            )}
            {flow === 'scanning' && (
                <StateScanning progress={scanProgress} startTime={scanStartTime} rateLimitSeconds={rateLimitSeconds} />
            )}
            {flow === 'complete' && (
                <StateComplete articles={scanResult ?? []} elapsedSeconds={scanElapsed} savedAt={scanSavedAt} />
            )}
        </PopupShell>
    );
}

export default App;
