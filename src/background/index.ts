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

type ProxyFetchMessage = {
    type: 'proxyFetch';
    url: string;
    init?: {
        method?: string;
        headers?: Record<string, string>;
        body?: string;
    };
};

const isProxyFetchMessage = (message: unknown): message is ProxyFetchMessage => {
    if (!message || typeof message !== 'object') {
        return false;
    }

    const candidate = message as ProxyFetchMessage;
    return candidate.type === 'proxyFetch' && typeof candidate.url === 'string';
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isProxyFetchMessage(message)) {
        return undefined;
    }

    const { url, init } = message;
    if (!/^https?:\/\//i.test(url)) {
        sendResponse({
            ok: false,
            status: 0,
            statusText: 'Invalid URL',
            headers: {},
            body: '',
        });
        return false;
    }

    const requestInit: RequestInit = {
        method: init?.method,
        headers: init?.headers,
        body: init?.body,
    };

    fetch(url, requestInit)
        .then(async (response) => {
            const body = await response.text();
            const headers: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                headers[key] = value;
            });

            sendResponse({
                ok: response.ok,
                status: response.status,
                statusText: response.statusText,
                headers,
                body,
            });
        })
        .catch((error) => {
            sendResponse({
                ok: false,
                status: 0,
                statusText: error instanceof Error ? error.message : 'Network error',
                headers: {},
                body: '',
            });
        });

    return true;
});

export { };
