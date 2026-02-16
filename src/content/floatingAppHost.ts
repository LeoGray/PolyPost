type FloatingAppMessage =
    | {
          type: 'polypost:floating_app';
          action: 'toggle';
      }
    | {
          type: 'polypost:floating_app';
          action: 'remove';
      };

type FloatingAppResponse = {
    ok: boolean;
    visible?: boolean;
    reason?: 'embed_unavailable' | 'not_supported';
};

const PANEL_ID = 'polypost-floating-app-host';
const IFRAME_ID = 'polypost-floating-app-frame';
const READY_MESSAGE_TYPE = 'polypost:embed-ready';
const READY_TIMEOUT_MS = 2000;
const X_HOSTS = ['x.com', 'twitter.com'];
const DEFAULT_PANEL_WIDTH = 380;
const MIN_PANEL_WIDTH = 300;
const MAX_PANEL_WIDTH = 680;
const VIEWPORT_MARGIN = 32;

const webext = (() => {
    const g = globalThis as any;
    return (g.browser ?? g.chrome) as typeof chrome | undefined;
})();

let panel: HTMLDivElement | null = null;
let iframe: HTMLIFrameElement | null = null;
let ready = false;
let waitingForReady: Promise<boolean> | null = null;
let panelWidth = DEFAULT_PANEL_WIDTH;
let cleanupResizeBindings: (() => void) | null = null;

const isFloatingAppMessage = (message: unknown): message is FloatingAppMessage => {
    if (!message || typeof message !== 'object') {
        return false;
    }

    const candidate = message as Partial<FloatingAppMessage>;
    return (
        candidate.type === 'polypost:floating_app' &&
        (candidate.action === 'toggle' || candidate.action === 'remove')
    );
};

const isXPage = (): boolean => {
    const host = window.location.hostname.toLowerCase();
    return X_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`));
};

const getMaxAllowedWidth = (): number => {
    return Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, window.innerWidth - VIEWPORT_MARGIN));
};

const clampPanelWidth = (width: number): number => {
    return Math.min(getMaxAllowedWidth(), Math.max(MIN_PANEL_WIDTH, width));
};

const applyPanelWidth = (width: number) => {
    panelWidth = clampPanelWidth(width);
    if (panel) {
        panel.style.width = `${panelWidth}px`;
    }
};

const bindResizeHandle = (handle: HTMLDivElement): (() => void) => {
    let resizing = false;
    let startX = 0;
    let startWidth = panelWidth;
    let dragOverlay: HTMLDivElement | null = null;

    const stopResizing = () => {
        if (!resizing) {
            return;
        }

        resizing = false;
        document.body.style.userSelect = '';
        removeDragOverlay();
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('blur', onWindowBlur);
    };

    const removeDragOverlay = () => {
        if (!dragOverlay) {
            return;
        }

        dragOverlay.removeEventListener('mousemove', onMouseMove);
        dragOverlay.removeEventListener('mouseup', onMouseUp);
        dragOverlay.remove();
        dragOverlay = null;
    };

    const ensureDragOverlay = () => {
        if (dragOverlay) {
            return;
        }

        dragOverlay = document.createElement('div');
        dragOverlay.style.position = 'fixed';
        dragOverlay.style.inset = '0';
        dragOverlay.style.zIndex = '2147483647';
        dragOverlay.style.cursor = 'ew-resize';
        dragOverlay.style.background = 'transparent';

        dragOverlay.addEventListener('mousemove', onMouseMove);
        dragOverlay.addEventListener('mouseup', onMouseUp);
        document.documentElement.appendChild(dragOverlay);
    };

    const onMouseMove = (event: MouseEvent) => {
        if (!resizing) {
            return;
        }

        const delta = startX - event.clientX;
        applyPanelWidth(startWidth + delta);
    };

    const onMouseUp = () => {
        stopResizing();
    };

    const onWindowBlur = () => {
        stopResizing();
    };

    const onMouseDown = (event: MouseEvent) => {
        if (event.button !== 0) {
            return;
        }

        resizing = true;
        startX = event.clientX;
        startWidth = panelWidth;
        document.body.style.userSelect = 'none';
        ensureDragOverlay();
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('blur', onWindowBlur);
        event.preventDefault();
    };

    const onWindowResize = () => {
        applyPanelWidth(panelWidth);
    };

    handle.addEventListener('mousedown', onMouseDown);
    window.addEventListener('resize', onWindowResize);

    return () => {
        stopResizing();
        removeDragOverlay();
        handle.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('resize', onWindowResize);
        window.removeEventListener('blur', onWindowBlur);
        if (document.body.style.userSelect === 'none') {
            document.body.style.userSelect = '';
        }
    };
};

const buildPanel = (): HTMLDivElement | null => {
    if (!webext?.runtime?.getURL || !isXPage()) {
        return null;
    }

    panelWidth = clampPanelWidth(panelWidth);

    const container = document.createElement('div');
    container.id = PANEL_ID;
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.right = '0';
    container.style.width = `${panelWidth}px`;
    container.style.maxWidth = '100vw';
    container.style.height = '100vh';
    container.style.zIndex = '2147483647';
    container.style.background = '#0f1419';
    container.style.borderLeft = '1px solid rgba(255, 255, 255, 0.12)';
    container.style.boxShadow = '0 0 24px rgba(0, 0, 0, 0.4)';
    container.style.display = 'none';
    container.style.overflow = 'hidden';
    container.style.boxSizing = 'border-box';

    const resizeHandle = document.createElement('div');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.top = '0';
    resizeHandle.style.left = '0';
    resizeHandle.style.width = '10px';
    resizeHandle.style.height = '100%';
    resizeHandle.style.cursor = 'ew-resize';
    resizeHandle.style.zIndex = '3';
    resizeHandle.style.background = 'transparent';

    const resizeGrip = document.createElement('div');
    resizeGrip.style.position = 'absolute';
    resizeGrip.style.left = '2px';
    resizeGrip.style.top = '50%';
    resizeGrip.style.transform = 'translateY(-50%)';
    resizeGrip.style.width = '2px';
    resizeGrip.style.height = '48px';
    resizeGrip.style.borderRadius = '999px';
    resizeGrip.style.background = 'rgba(255, 255, 255, 0.3)';
    resizeHandle.appendChild(resizeGrip);

    const header = document.createElement('div');
    header.style.height = '40px';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.padding = '0 12px';
    header.style.background = 'rgba(0, 0, 0, 0.25)';
    header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.12)';
    header.style.color = '#fff';
    header.style.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    header.textContent = 'PolyPost';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = 'Close';
    closeButton.style.cursor = 'pointer';
    closeButton.style.border = 'none';
    closeButton.style.background = 'transparent';
    closeButton.style.color = '#fff';
    closeButton.style.font = "500 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    closeButton.addEventListener('click', () => {
        hidePanel();
    });

    const body = document.createElement('div');
    body.style.height = 'calc(100vh - 40px)';
    body.style.width = '100%';

    const frame = document.createElement('iframe');
    frame.id = IFRAME_ID;
    frame.src = `${webext.runtime.getURL('src/sidepanel/index.html')}?embedded=1`;
    frame.style.width = '100%';
    frame.style.height = '100%';
    frame.style.border = 'none';
    frame.style.background = '#0f1419';
    frame.setAttribute('allow', 'clipboard-read; clipboard-write');

    body.appendChild(frame);
    header.appendChild(closeButton);
    container.appendChild(resizeHandle);
    container.appendChild(header);
    container.appendChild(body);

    document.documentElement.appendChild(container);

    cleanupResizeBindings?.();
    cleanupResizeBindings = bindResizeHandle(resizeHandle);
    container.style.width = `${panelWidth}px`;
    iframe = frame;
    return container;
};

const ensurePanel = (): HTMLDivElement | null => {
    if (panel && panel.isConnected) {
        return panel;
    }

    panel = buildPanel();
    return panel;
};

const removePanel = () => {
    cleanupResizeBindings?.();
    cleanupResizeBindings = null;
    panel?.remove();
    panel = null;
    iframe = null;
    ready = false;
    waitingForReady = null;
};

const hidePanel = () => {
    const host = ensurePanel();
    if (!host) {
        return;
    }

    host.style.display = 'none';
};

const waitForEmbedReady = async (): Promise<boolean> => {
    if (ready) {
        return true;
    }

    if (!iframe) {
        return false;
    }

    if (waitingForReady) {
        return waitingForReady;
    }

    const currentFrame = iframe;
    waitingForReady = new Promise<boolean>((resolve) => {
        let settled = false;

        const finish = (value: boolean) => {
            if (settled) {
                return;
            }

            settled = true;
            window.clearTimeout(timeoutId);
            window.removeEventListener('message', onMessage);
            currentFrame.removeEventListener('error', onError);
            waitingForReady = null;
            if (value) {
                ready = true;
            }
            resolve(value);
        };

        const onMessage = (event: MessageEvent) => {
            if (event.source !== currentFrame.contentWindow) {
                return;
            }

            if (!event.data || typeof event.data !== 'object') {
                return;
            }

            const data = event.data as { type?: string };
            if (data.type !== READY_MESSAGE_TYPE) {
                return;
            }

            finish(true);
        };

        const onError = () => finish(false);
        const timeoutId = window.setTimeout(() => finish(false), READY_TIMEOUT_MS);

        window.addEventListener('message', onMessage);
        currentFrame.addEventListener('error', onError, { once: true });
    });

    return waitingForReady;
};

const showPanel = async (): Promise<FloatingAppResponse> => {
    const host = ensurePanel();
    if (!host) {
        return {
            ok: false,
            reason: 'not_supported',
        };
    }

    host.style.display = 'block';

    const embeddedReady = await waitForEmbedReady();
    if (!embeddedReady) {
        removePanel();
        return {
            ok: false,
            reason: 'embed_unavailable',
        };
    }

    return {
        ok: true,
        visible: true,
    };
};

const togglePanel = async (): Promise<FloatingAppResponse> => {
    const host = ensurePanel();
    if (!host) {
        return {
            ok: false,
            reason: 'not_supported',
        };
    }

    const visible = host.style.display !== 'none';
    if (visible) {
        hidePanel();
        return {
            ok: true,
            visible: false,
        };
    }

    return showPanel();
};

if (webext?.runtime?.onMessage?.addListener) {
    webext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (!isFloatingAppMessage(message)) {
            return undefined;
        }

        (async () => {
            try {
                if (message.action === 'remove') {
                    removePanel();
                    sendResponse?.({ ok: true, visible: false } satisfies FloatingAppResponse);
                    return;
                }

                const result = await togglePanel();
                sendResponse?.(result);
            } catch (error) {
                console.error('Floating app host failed', error);
                sendResponse?.({
                    ok: false,
                    reason: 'embed_unavailable',
                } satisfies FloatingAppResponse);
            }
        })();

        return true;
    });
}

export {};
