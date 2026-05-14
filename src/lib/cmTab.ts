// src/lib/cmTab.ts — helpers for locating and focusing the Cardmarket browser tab

export async function findCMTab(autoOpen = true): Promise<number | null> {
    const tabs = await chrome.tabs.query({ url: 'https://www.cardmarket.com/*' });
    if (tabs[0]?.id != null) return tabs[0].id;
    if (!autoOpen) return null;

    const tab = await chrome.tabs.create({ url: 'https://www.cardmarket.com', active: true });
    if (tab.id == null) return null;

    await chrome.windows.update(tab.windowId!, { focused: true });

    // Poll until the tab finishes loading (max 15 s)
    for (let i = 0; i < 30; i++) {
        await new Promise<void>((r) => setTimeout(r, 500));
        const t = await chrome.tabs.get(tab.id);
        if (t.status === 'complete') break;
    }

    return tab.id;
}

export async function focusCMTab(): Promise<void> {
    const tabs = await chrome.tabs.query({ url: 'https://www.cardmarket.com/*' });
    const tab = tabs[0];
    if (!tab?.id || !tab.windowId) return;
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
}
