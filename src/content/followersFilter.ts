type PanelCopy = {
    title: string;
    filters: {
        fans: string;
        notFollowing: string;
        verified: string;
        unverified: string;
    };
    actions: {
        apply: string;
        reset: string;
    };
    hint: string;
};

type FollowersFilterMessage =
    | {
          type: 'polypost:followers_filter';
          action: 'inject';
          copy?: PanelCopy;
      }
    | {
          type: 'polypost:followers_filter';
          action: 'remove';
      };

const isFollowersFilterMessage = (message: unknown): message is FollowersFilterMessage => {
    if (!message || typeof message !== 'object') {
        return false;
    }

    const candidate = message as Partial<FollowersFilterMessage>;
    return (
        candidate.type === 'polypost:followers_filter' &&
        (candidate.action === 'inject' || candidate.action === 'remove')
    );
};

const injectFollowersFilter = (copy?: PanelCopy) => {
    const win = window as any;
    if (win.__polypostXFilterInitialized) {
        if (typeof win.__polypostXFilterApply === 'function') {
            win.__polypostXFilterApply();
        }
        return;
    }

    const PANEL_ID = 'polypost-x-filter';
    const STYLE_ID = 'polypost-x-filter-style';
    const labels = {
        followsYou: ['follows you', '关注了你', '关注你'],
        following: ['following', 'unfollow', '已关注', '关注中', '正在关注', '取消关注'],
        follow: ['follow', 'follow back', '关注', '回关'],
    };

    const state = {
        fansNotFollowed: false,
        notFollowingBack: false,
        verifiedOnly: false,
        unverifiedOnly: false,
    };

    const panelCopy: PanelCopy = copy || {
        title: 'PolyPost Follower Filter',
        filters: {
            fans: "Show followers you don't follow back",
            notFollowing: "Show following who don't follow back",
            verified: 'Verified only',
            unverified: 'Unverified only',
        },
        actions: {
            apply: 'Refresh',
            reset: 'Reset',
        },
        hint: 'Auto-refresh after you scroll to load more',
    };

    const normalizeText = (value: string | null | undefined) =>
        (value || '').replace(/\s+/g, ' ').trim();

    const getListType = () => {
        const segments = window.location.pathname.split('/').filter(Boolean);
        const listSegment = segments.find((segment) =>
            ['followers', 'verified_followers', 'following'].includes(segment),
        );

        if (!listSegment) {
            return null;
        }

        if (listSegment === 'followers' || listSegment === 'verified_followers') {
            return listSegment;
        }

        return 'following';
    };

    const getUserCells = () =>
        Array.from(document.querySelectorAll('[data-testid="UserCell"]')) as HTMLElement[];

    const matchesLabel = (value: string, candidates: string[]) =>
        candidates.some((label) => {
            if (!value) {
                return false;
            }
            return (
                value === label ||
                value.startsWith(`${label} `) ||
                value.startsWith(label) ||
                value.includes(label)
            );
        });

    const findFollowElement = (cell: HTMLElement) => {
        const byTestId = cell.querySelector<HTMLElement>(
            'button[data-testid="unfollow"], button[data-testid="follow"]',
        );
        if (byTestId) {
            return byTestId;
        }

        const byPartialTestId = cell.querySelector<HTMLElement>(
            'button[data-testid*="follow"], div[data-testid*="follow"]',
        );
        if (byPartialTestId) {
            return byPartialTestId;
        }

        const searchScopes = [cell, cell.parentElement, cell.parentElement?.parentElement].filter(
            Boolean,
        ) as HTMLElement[];

        for (const scope of searchScopes) {
            const candidates = Array.from(
                scope.querySelectorAll<HTMLElement>('div[role="button"], button'),
            );
            const match = candidates.find((el) => {
                const label = normalizeText(
                    el.getAttribute('aria-label') || el.textContent,
                ).toLowerCase();
                return matchesLabel(label, labels.following) || matchesLabel(label, labels.follow);
            });

            if (match) {
                return match;
            }
        }

        return null;
    };

    const isFollowing = (cell: HTMLElement) => {
        const followButton = findFollowElement(cell);

        if (!followButton) {
            return null;
        }

        const testId = followButton.getAttribute('data-testid');
        if (testId === 'unfollow') {
            return true;
        }
        if (testId === 'follow') {
            return false;
        }

        const buttonText = normalizeText(
            followButton.getAttribute('aria-label') || followButton.textContent,
        ).toLowerCase();
        if (matchesLabel(buttonText, labels.following)) {
            return true;
        }
        if (matchesLabel(buttonText, labels.follow)) {
            return false;
        }

        return null;
    };

    const isVerified = (cell: HTMLElement) => {
        const badge =
            cell.querySelector<HTMLElement>('[data-testid*="verified"]') ||
            cell.querySelector<HTMLElement>('svg[aria-label*="Verified"]') ||
            cell.querySelector<HTMLElement>('svg[aria-label*="认证"]') ||
            cell.querySelector<HTMLElement>('[aria-label*="Verified"]') ||
            cell.querySelector<HTMLElement>('[aria-label*="认证"]');

        return !!badge;
    };

    const followsYou = (cell: HTMLElement) => {
        const socialContext = cell.querySelector<HTMLElement>('[data-testid="socialContext"]');
        if (socialContext) {
            const text = normalizeText(socialContext.textContent).toLowerCase();
            if (matchesLabel(text, labels.followsYou)) {
                return true;
            }
        }

        const ariaLabelMatch = cell.querySelector<HTMLElement>(
            '[aria-label*="Follows you"], [aria-label*="关注了你"], [aria-label*="关注你"]',
        );
        if (ariaLabelMatch) {
            return true;
        }

        const spans = Array.from(cell.querySelectorAll('span'));
        const hasLabel = spans.some((span) => {
            const text = normalizeText(span.textContent).toLowerCase();
            return matchesLabel(text, labels.followsYou);
        });

        if (hasLabel) {
            return true;
        }

        const cellText = normalizeText(cell.textContent).toLowerCase();
        return matchesLabel(cellText, labels.followsYou) ? true : false;
    };

    const shouldHide = (cell: HTMLElement, listType: string) => {
        const verified = isVerified(cell);
        if (state.verifiedOnly && !verified) {
            return true;
        }
        if (state.unverifiedOnly && verified) {
            return true;
        }

        if (listType === 'following') {
            if (!state.notFollowingBack) {
                return false;
            }
            const follows = followsYou(cell);
            if (follows === true) {
                return true;
            }
            return false;
        }

        if (listType === 'followers' || listType === 'verified_followers') {
            if (!state.fansNotFollowed) {
                return false;
            }
            const following = isFollowing(cell);
            if (following === true) {
                return true;
            }
            return false;
        }

        return false;
    };

    const applyFilters = () => {
        const listType = getListType();
        if (!listType) {
            return;
        }

        const cells = getUserCells();
        cells.forEach((cell) => {
            const hide = shouldHide(cell, listType);
            cell.style.display = hide ? 'none' : '';
        });
    };

    const applyFiltersToCells = (cells: HTMLElement[]) => {
        const listType = getListType();
        if (!listType || cells.length === 0) {
            return;
        }

        cells.forEach((cell) => {
            const hide = shouldHide(cell, listType);
            cell.style.display = hide ? 'none' : '';
        });
    };

    const collectUserCells = (nodes: NodeList | Node[]): HTMLElement[] => {
        const collected: HTMLElement[] = [];
        nodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) {
                return;
            }

            if (node.matches?.('[data-testid="UserCell"]')) {
                collected.push(node);
                return;
            }

            const nested = node.querySelectorAll?.('[data-testid="UserCell"]');
            if (nested && nested.length > 0) {
                const nestedCells = Array.from(nested).filter(
                    (item): item is HTMLElement => item instanceof HTMLElement,
                );
                collected.push(...nestedCells);
            }
        });

        return collected;
    };

    const ensureStyles = () => {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #${PANEL_ID} {
                position: fixed;
                top: 16px;
                right: 16px;
                z-index: 2147483647;
                background: rgba(16, 16, 16, 0.92);
                color: #fff;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 12px 14px;
                width: 240px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
            }
            #${PANEL_ID} .pp-title {
                font-size: 13px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            #${PANEL_ID} .pp-option {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                line-height: 1.4;
                margin-bottom: 8px;
            }
            #${PANEL_ID} .pp-option input {
                width: 14px;
                height: 14px;
            }
            #${PANEL_ID} .pp-actions {
                display: flex;
                gap: 8px;
                margin-top: 6px;
            }
            #${PANEL_ID} .pp-button {
                flex: 1;
                background: #1d9bf0;
                color: #fff;
                border: none;
                border-radius: 8px;
                font-size: 12px;
                padding: 6px 8px;
                cursor: pointer;
            }
            #${PANEL_ID} .pp-button.secondary {
                background: rgba(255, 255, 255, 0.1);
            }
            #${PANEL_ID} .pp-hint {
                margin-top: 6px;
                font-size: 11px;
                color: rgba(255, 255, 255, 0.7);
            }
        `;

        document.head.appendChild(style);
    };

    const ensurePanel = () => {
        if (document.getElementById(PANEL_ID)) {
            return;
        }

        ensureStyles();

        const panel = document.createElement('div');
        panel.id = PANEL_ID;

        panel.innerHTML = `
            <div class="pp-title">${panelCopy.title}</div>
            <label class="pp-option" data-filter="fans">
                <input type="checkbox" />
                <span>${panelCopy.filters.fans}</span>
            </label>
            <label class="pp-option" data-filter="not-following">
                <input type="checkbox" />
                <span>${panelCopy.filters.notFollowing}</span>
            </label>
            <label class="pp-option" data-filter="verified">
                <input type="checkbox" />
                <span>${panelCopy.filters.verified}</span>
            </label>
            <label class="pp-option" data-filter="unverified">
                <input type="checkbox" />
                <span>${panelCopy.filters.unverified}</span>
            </label>
            <div class="pp-actions">
                <button class="pp-button" data-action="apply">${panelCopy.actions.apply}</button>
                <button class="pp-button secondary" data-action="reset">${panelCopy.actions.reset}</button>
            </div>
            <div class="pp-hint">${panelCopy.hint}</div>
        `;

        document.body.appendChild(panel);

        const fansToggle = panel.querySelector<HTMLInputElement>('[data-filter="fans"] input');
        const notFollowingToggle = panel.querySelector<HTMLInputElement>(
            '[data-filter="not-following"] input',
        );
        const verifiedToggle = panel.querySelector<HTMLInputElement>(
            '[data-filter="verified"] input',
        );
        const unverifiedToggle = panel.querySelector<HTMLInputElement>(
            '[data-filter="unverified"] input',
        );
        const applyButton = panel.querySelector<HTMLButtonElement>('[data-action="apply"]');
        const resetButton = panel.querySelector<HTMLButtonElement>('[data-action="reset"]');

        if (fansToggle) {
            fansToggle.checked = state.fansNotFollowed;
            fansToggle.addEventListener('change', () => {
                state.fansNotFollowed = fansToggle.checked;
                scheduleApplyFull();
            });
        }

        if (notFollowingToggle) {
            notFollowingToggle.checked = state.notFollowingBack;
            notFollowingToggle.addEventListener('change', () => {
                state.notFollowingBack = notFollowingToggle.checked;
                scheduleApplyFull();
            });
        }

        if (verifiedToggle) {
            verifiedToggle.checked = state.verifiedOnly;
            verifiedToggle.addEventListener('change', () => {
                state.verifiedOnly = verifiedToggle.checked;
                if (state.verifiedOnly && unverifiedToggle) {
                    state.unverifiedOnly = false;
                    unverifiedToggle.checked = false;
                }
                scheduleApplyFull();
            });
        }

        if (unverifiedToggle) {
            unverifiedToggle.checked = state.unverifiedOnly;
            unverifiedToggle.addEventListener('change', () => {
                state.unverifiedOnly = unverifiedToggle.checked;
                if (state.unverifiedOnly && verifiedToggle) {
                    state.verifiedOnly = false;
                    verifiedToggle.checked = false;
                }
                scheduleApplyFull();
            });
        }

        if (applyButton) {
            applyButton.addEventListener('click', () => {
                scheduleApplyFull();
            });
        }

        if (resetButton) {
            resetButton.addEventListener('click', () => {
                state.fansNotFollowed = false;
                state.notFollowingBack = false;
                state.verifiedOnly = false;
                state.unverifiedOnly = false;
                if (fansToggle) {
                    fansToggle.checked = false;
                }
                if (notFollowingToggle) {
                    notFollowingToggle.checked = false;
                }
                if (verifiedToggle) {
                    verifiedToggle.checked = false;
                }
                if (unverifiedToggle) {
                    unverifiedToggle.checked = false;
                }
                scheduleApplyFull();
            });
        }
    };

    const updatePanelVisibility = () => {
        const panel = document.getElementById(PANEL_ID);
        if (!panel) {
            return;
        }

        const listType = getListType();
        panel.style.display = listType ? 'block' : 'none';

        const fansOption = panel.querySelector<HTMLElement>('[data-filter="fans"]');
        const notFollowingOption = panel.querySelector<HTMLElement>(
            '[data-filter="not-following"]',
        );

        if (fansOption) {
            fansOption.style.display =
                listType === 'followers' || listType === 'verified_followers' ? 'flex' : 'none';
        }

        if (notFollowingOption) {
            notFollowingOption.style.display = listType === 'following' ? 'flex' : 'none';
        }
    };

    let scheduled = false;
    const scheduleApplyFull = () => {
        if (scheduled) {
            return;
        }

        scheduled = true;
        window.requestAnimationFrame(() => {
            scheduled = false;
            updatePanelVisibility();
            applyFilters();
        });
    };

    let pendingCells = new Set<HTMLElement>();
    let pendingTimer: number | null = null;
    const scheduleApplyForCells = (cells: HTMLElement[]) => {
        if (cells.length === 0) {
            return;
        }

        cells.forEach((cell) => pendingCells.add(cell));

        if (pendingTimer !== null) {
            return;
        }

        pendingTimer = window.setTimeout(() => {
            pendingTimer = null;
            const batch = Array.from(pendingCells);
            pendingCells.clear();
            if (batch.length === 0) {
                return;
            }

            const run = () => applyFiltersToCells(batch);
            if ('requestIdleCallback' in window) {
                (window as any).requestIdleCallback(run, { timeout: 200 });
            } else {
                run();
            }
        }, 150);
    };

    const observer = new MutationObserver((mutations) => {
        const addedNodes: Node[] = [];
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => addedNodes.push(node));
        });

        const newCells = collectUserCells(addedNodes);
        if (newCells.length > 0) {
            scheduleApplyForCells(newCells);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const routeInterval = window.setInterval(() => {
        if (win.__polypostXFilterLastUrl !== window.location.href) {
            win.__polypostXFilterLastUrl = window.location.href;
            scheduleApplyFull();
        }
    }, 800);

    const cleanup = () => {
        observer.disconnect();
        window.clearInterval(routeInterval);
        document.getElementById(PANEL_ID)?.remove();
        document.getElementById(STYLE_ID)?.remove();
        delete win.__polypostXFilterInitialized;
        delete win.__polypostXFilterApply;
        delete win.__polypostXFilterCleanup;
        delete win.__polypostXFilterLastUrl;
    };

    win.__polypostXFilterInitialized = true;
    win.__polypostXFilterApply = scheduleApplyFull;
    win.__polypostXFilterCleanup = cleanup;
    win.__polypostXFilterLastUrl = window.location.href;

    ensurePanel();
    updatePanelVisibility();
    applyFilters();
};

const removeFollowersFilter = () => {
    const win = window as any;
    if (typeof win.__polypostXFilterCleanup === 'function') {
        win.__polypostXFilterCleanup();
    }
};

const webext = (() => {
    const g = globalThis as any;
    return (g.browser ?? g.chrome) as typeof chrome | undefined;
})();

if (webext?.runtime?.onMessage?.addListener) {
    webext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (!isFollowersFilterMessage(message)) {
            return undefined;
        }

        try {
            if (message.action === 'inject') {
                injectFollowersFilter(message.copy);
            } else {
                removeFollowersFilter();
            }

            sendResponse?.({ ok: true });
        } catch (error) {
            console.error('Followers filter content script failed', error);
            sendResponse?.({
                ok: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }

        return undefined;
    });
}

export {};

