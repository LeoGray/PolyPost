export type WebExtensionApi = typeof chrome;

/**
 * Prefer the standard `browser` namespace (Firefox, Safari) and fall back to `chrome` (Chrome).
 * Both are typed as `typeof chrome` so we can use the Promise-based MV3 overloads.
 */
export const getWebExt = (): WebExtensionApi | undefined => {
    const g = globalThis as any;
    return (g.browser ?? g.chrome) as WebExtensionApi | undefined;
};

export const isWebExtEnv = (): boolean => {
    const webext = getWebExt();
    return !!webext?.runtime?.id;
};

export const getExtensionUrl = (path: string): string | null => {
    const webext = getWebExt();
    if (!webext?.runtime?.getURL) {
        return null;
    }
    return webext.runtime.getURL(path);
};

export const getActiveTab = async (): Promise<chrome.tabs.Tab | undefined> => {
    const webext = getWebExt();
    if (!webext?.tabs?.query) {
        return undefined;
    }
    const tabs = await webext.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
};

/**
 * Open the PolyPost UI.
 * - Chrome: prefer `sidePanel.open` when available.
 * - Others: fall back to opening the app UI as an extension page tab.
 */
export const openPolyPost = async (tabId?: number): Promise<void> => {
    const webext = getWebExt();
    if (!webext?.runtime?.getURL || !webext?.tabs?.create) {
        return;
    }

    const sidePanel = (webext as any).sidePanel as { open?: (options: any) => Promise<void> } | undefined;
    if (sidePanel?.open && typeof tabId === 'number') {
        try {
            await sidePanel.open({ tabId });
            return;
        } catch {
            // Ignore and fall back to opening a tab.
        }
    }

    const url = webext.runtime.getURL('src/sidepanel/index.html');
    await webext.tabs.create({ url });
};

export const openPolyPostForCurrentTab = async (): Promise<void> => {
    const tab = await getActiveTab();
    await openPolyPost(tab?.id);
};

export const openPolyPostWindow = async (): Promise<void> => {
    const webext = getWebExt();
    if (!webext?.runtime?.getURL) {
        return;
    }

    const url = webext.runtime.getURL('src/sidepanel/index.html');
    const windowsApi = (webext as any).windows as
        | {
              create?: (options: {
                  url: string;
                  type: 'popup';
                  width: number;
                  height: number;
              }) => Promise<unknown>;
          }
        | undefined;

    if (windowsApi?.create) {
        try {
            await windowsApi.create({
                url,
                type: 'popup',
                width: 440,
                height: 900,
            });
            return;
        } catch {
            // Ignore and fall back to opening a regular tab.
        }
    }

    if (webext?.tabs?.create) {
        await webext.tabs.create({ url });
    }
};
