import React, { useState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { ensureHostPermission } from '@/services/permissions';
import { ExternalLink, Wand2 } from 'lucide-react';

type ListType = 'followers' | 'verified_followers' | 'following';

const X_HOSTS = ['x.com', 'twitter.com'];

const sanitizeHandleInput = (handle: string) => handle.replace(/^@/, '').trim();

const isXDomain = (url: URL) => {
    const host = url.hostname.toLowerCase();
    return X_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`));
};

const injectFollowersFilter = () => {
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
            <div class="pp-title">PolyPost 关注过滤</div>
            <label class="pp-option" data-filter="fans">
                <input type="checkbox" />
                <span>只看对方关注我但我未关注</span>
            </label>
            <label class="pp-option" data-filter="not-following">
                <input type="checkbox" />
                <span>只看我关注但未回关</span>
            </label>
            <label class="pp-option" data-filter="verified">
                <input type="checkbox" />
                <span>只看蓝标</span>
            </label>
            <label class="pp-option" data-filter="unverified">
                <input type="checkbox" />
                <span>只看非蓝标</span>
            </label>
            <div class="pp-actions">
                <button class="pp-button" data-action="apply">刷新</button>
                <button class="pp-button secondary" data-action="reset">重置</button>
            </div>
            <div class="pp-hint">滚动加载更多后会自动刷新</div>
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
                scheduleApply();
            });
        }

        if (notFollowingToggle) {
            notFollowingToggle.checked = state.notFollowingBack;
            notFollowingToggle.addEventListener('change', () => {
                state.notFollowingBack = notFollowingToggle.checked;
                scheduleApply();
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
                scheduleApply();
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
                scheduleApply();
            });
        }

        if (applyButton) {
            applyButton.addEventListener('click', () => {
                scheduleApply();
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
                scheduleApply();
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
    const scheduleApply = () => {
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

    const observer = new MutationObserver(() => {
        scheduleApply();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const routeInterval = window.setInterval(() => {
        if (win.__polypostXFilterLastUrl !== window.location.href) {
            win.__polypostXFilterLastUrl = window.location.href;
            scheduleApply();
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
    win.__polypostXFilterApply = scheduleApply;
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

export const FollowersFilter: React.FC = () => {
    const { t } = useTranslation();
    const [handleInput, setHandleInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [isWorking, setIsWorking] = useState(false);

    const canUseExtension = () =>
        typeof chrome !== 'undefined' && !!chrome.tabs && !!chrome.scripting;

    const openListPage = (listType: ListType) => {
        const handle = sanitizeHandleInput(handleInput);
        if (!handle) {
            return;
        }

        if (!canUseExtension()) {
            setError(t('followers_filter.error.no_extension'));
            return;
        }

        setError(null);
        setStatus(null);
        const url = `https://x.com/${handle}/${listType}`;
        chrome.tabs.create({ url });
    };

    const runScript = async (action: 'inject' | 'remove') => {
        if (!canUseExtension()) {
            setError(t('followers_filter.error.no_extension'));
            return;
        }

        setIsWorking(true);
        setError(null);
        setStatus(null);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id || !tab.url) {
                setError(t('followers_filter.error.no_tab'));
                return;
            }

            let url: URL;
            try {
                url = new URL(tab.url);
            } catch {
                setError(t('followers_filter.error.invalid_url'));
                return;
            }

            if (!isXDomain(url)) {
                setError(t('followers_filter.error.not_x'));
                return;
            }

            const permissionResult = await ensureHostPermission(url.origin);
            if (!permissionResult.granted) {
                setError(
                    t(
                        'followers_filter.error.permission_denied',
                        permissionResult.origin || url.origin,
                    ),
                );
                return;
            }

            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: action === 'inject' ? injectFollowersFilter : removeFollowersFilter,
            });

            setStatus(
                action === 'inject'
                    ? t('followers_filter.status.injected')
                    : t('followers_filter.status.removed'),
            );
        } catch (scriptError) {
            console.error('Followers filter action failed', scriptError);
            setError(t('followers_filter.error.failed'));
        } finally {
            setIsWorking(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">
                    {t('followers_filter.title')}
                </h1>
                <p className="text-text-muted mt-1">{t('followers_filter.subtitle')}</p>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {status && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
                    {status}
                </div>
            )}

            <Card className="p-4 space-y-4">
                <Input
                    label={t('followers_filter.handle.label')}
                    placeholder={t('followers_filter.handle.placeholder')}
                    value={handleInput}
                    onChange={(event) => setHandleInput(event.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => openListPage('followers')}
                        disabled={!sanitizeHandleInput(handleInput)}
                    >
                        {t('followers_filter.open.followers')}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => openListPage('verified_followers')}
                        disabled={!sanitizeHandleInput(handleInput)}
                    >
                        {t('followers_filter.open.verified_followers')}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => openListPage('following')}
                        disabled={!sanitizeHandleInput(handleInput)}
                    >
                        {t('followers_filter.open.following')}
                    </Button>
                </div>
                <p className="text-xs text-text-muted">{t('followers_filter.tip')}</p>
            </Card>

            <Card className="p-4 space-y-3">
                <Button onClick={() => runScript('inject')} isLoading={isWorking}>
                    <Wand2 size={16} className="mr-2" />
                    {t('followers_filter.inject')}
                </Button>
                <Button variant="ghost" onClick={() => runScript('remove')} disabled={isWorking}>
                    {t('followers_filter.remove')}
                </Button>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                    <ExternalLink size={14} />
                    <span>{t('followers_filter.tip_link')}</span>
                </div>
            </Card>
        </div>
    );
};
