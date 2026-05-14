chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onStartup.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// When a Cardmarket tab finishes loading, notify the side panel so it can
// auto-retry detect if it's currently in the not-logged-in state.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return;
    if (!tab.url?.startsWith('https://www.cardmarket.com/')) return;
    chrome.runtime.sendMessage({ type: 'cm-tab-loaded', tabId }).catch(() => {});
});
