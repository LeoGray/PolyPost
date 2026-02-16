import React, { useState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { ensureHostPermission } from '@/services/permissions';
import { getWebExt } from '@/services/webext';
import { ExternalLink, Wand2 } from 'lucide-react';

type ListType = 'followers' | 'verified_followers' | 'following';
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

const X_HOSTS = ['x.com', 'twitter.com'];

const sanitizeHandleInput = (handle: string) => handle.replace(/^@/, '').trim();

const isXDomain = (url: URL) => {
    const host = url.hostname.toLowerCase();
    return X_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`));
};

export const FollowersFilter: React.FC = () => {
    const { t } = useTranslation();
    const [handleInput, setHandleInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [isWorking, setIsWorking] = useState(false);

    const canUseExtension = () => {
        const webext = getWebExt();
        return !!(webext?.runtime?.id && webext.tabs);
    };

    const openListPage = async (listType: ListType) => {
        const handle = sanitizeHandleInput(handleInput);
        if (!handle) {
            return;
        }

        const webext = getWebExt();
        if (!webext?.tabs) {
            setError(t('followers_filter.error.no_extension'));
            return;
        }

        setError(null);
        setStatus(null);
        const url = `https://x.com/${handle}/${listType}`;
        await webext.tabs.create({ url });
    };

    const runScript = async (action: 'inject' | 'remove') => {
        if (!canUseExtension()) {
            setError(t('followers_filter.error.no_extension'));
            return;
        }

        const webext = getWebExt();
        if (!webext?.tabs) {
            setError(t('followers_filter.error.no_extension'));
            return;
        }

        setIsWorking(true);
        setError(null);
        setStatus(null);

        try {
            const [tab] = await webext.tabs.query({ active: true, currentWindow: true });
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

            const panelCopy: PanelCopy = {
                title: t('followers_filter.panel.title'),
                filters: {
                    fans: t('followers_filter.panel.fans'),
                    notFollowing: t('followers_filter.panel.not_following'),
                    verified: t('followers_filter.panel.verified'),
                    unverified: t('followers_filter.panel.unverified'),
                },
                actions: {
                    apply: t('followers_filter.panel.apply'),
                    reset: t('followers_filter.panel.reset'),
                },
                hint: t('followers_filter.panel.hint'),
            };

            await webext.tabs.sendMessage(tab.id, {
                type: 'polypost:followers_filter',
                action,
                ...(action === 'inject' ? { copy: panelCopy } : {}),
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
                        onClick={() => void openListPage('followers')}
                        disabled={!sanitizeHandleInput(handleInput)}
                    >
                        {t('followers_filter.open.followers')}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => void openListPage('verified_followers')}
                        disabled={!sanitizeHandleInput(handleInput)}
                    >
                        {t('followers_filter.open.verified_followers')}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => void openListPage('following')}
                        disabled={!sanitizeHandleInput(handleInput)}
                    >
                        {t('followers_filter.open.following')}
                    </Button>
                </div>
                <p className="text-xs text-text-muted">{t('followers_filter.tip')}</p>
            </Card>

            <Card className="p-4 space-y-3">
                <Button onClick={() => void runScript('inject')} isLoading={isWorking}>
                    <Wand2 size={16} className="mr-2" />
                    {t('followers_filter.inject')}
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => void runScript('remove')}
                    disabled={isWorking}
                >
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
