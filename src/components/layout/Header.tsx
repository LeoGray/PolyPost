import React from 'react';
import { Search, Grid, List, Plus, Languages } from 'lucide-react';
import { Button } from '@/components/ui';
import { useUIStore, useSettingsStore } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';

interface HeaderProps {
    onNewPost: () => void;
    onSettings: () => void;
    showNewPost?: boolean;
    showSearch?: boolean;
    showViewToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    onNewPost,
    onSettings,
    showNewPost = true,
    showSearch = true,
    showViewToggle = true,
}) => {
    const { viewMode, setViewMode, searchQuery, setSearchQuery } = useUIStore();
    const { uiLanguage, setUiLanguage } = useSettingsStore();
    const { t } = useTranslation();

    const toggleLanguage = () => {
        setUiLanguage(uiLanguage === 'zh' ? 'en' : 'zh');
    };

    return (
        <header className="h-16 bg-bg-primary border-b border-border-primary flex items-center justify-between px-6">
            {/* Search */}
            {showSearch ? (
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                        />
                        <input
                            type="text"
                            placeholder={t('dashboard.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-primary rounded-lg
              text-text-primary placeholder-text-muted text-sm
              focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                    </div>
                </div>
            ) : (
                <div className="flex-1" />
            )}

            {/* Right side */}
            <div className="flex items-center gap-3 ml-4">
                {/* View mode toggle */}
                {showViewToggle && (
                    <div className="flex items-center bg-bg-secondary border border-border-primary rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-bg-tertiary text-text-primary'
                                    : 'text-text-muted hover:text-text-primary'
                            }`}
                            title="Grid view"
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-bg-tertiary text-text-primary'
                                    : 'text-text-muted hover:text-text-primary'
                            }`}
                            title="List view"
                        >
                            <List size={18} />
                        </button>
                    </div>
                )}

                {/* New Post button */}
                {showNewPost && (
                    <Button onClick={onNewPost} leftIcon={<Plus size={18} />}>
                        {t('nav.new_post')}
                    </Button>
                )}

                {/* Language Switcher */}
                <button
                    onClick={toggleLanguage}
                    className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
                    title={uiLanguage === 'zh' ? 'Switch to English' : '切换到中文'}
                >
                    <Languages size={20} />
                </button>

                {/* Settings button */}
                <button
                    onClick={onSettings}
                    className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary"
                    title="Settings"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </button>
            </div>
        </header>
    );
};
