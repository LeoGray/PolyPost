// Background service worker for PolyPost Chrome Extension

// Open side panel on extension icon click
chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
        chrome.sidePanel.open({ tabId: tab.id });
    }
});

// Set side panel behavior
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('PolyPost extension installed');

        // Initialize default settings
        chrome.storage.sync.set({
            settings: {
                openaiApiKey: '',
                defaultLanguage: 'en',
                defaultPolishTemplate: 'professional',
                theme: 'dark',
            },
        });
    }
});

export { };
