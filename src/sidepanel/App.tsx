import React, { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard';
import { Editor } from './Editor';
import { Settings } from './Settings';
import { useSettingsStore, usePostsStore, useFoldersStore } from '@/store';

type Page = 'dashboard' | 'editor' | 'settings';

export const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const { loadSettings } = useSettingsStore();
    const { loadPosts } = usePostsStore();
    const { loadFolders } = useFoldersStore();

    // Load initial data
    useEffect(() => {
        loadSettings();
        loadPosts();
        loadFolders();
    }, [loadSettings, loadPosts, loadFolders]);

    // Apply theme
    const { theme } = useSettingsStore();

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            const applySystemTheme = () => {
                const systemTheme = mediaQuery.matches ? 'dark' : 'light';
                // Ensure we don't duplicate classes if logic runs multiple times
                root.classList.remove('light', 'dark');
                root.classList.add(systemTheme);
            };

            applySystemTheme();

            mediaQuery.addEventListener('change', applySystemTheme);
            return () => mediaQuery.removeEventListener('change', applySystemTheme);
        }

        root.classList.add(theme);
    }, [theme]);

    const navigateToDashboard = () => {
        setCurrentPage('dashboard');
    };

    const navigateToEditor = () => {
        setCurrentPage('editor');
    };

    const navigateToSettings = () => {
        setCurrentPage('settings');
    };

    switch (currentPage) {
        case 'editor':
            return <Editor onNavigateBack={navigateToDashboard} />;
        case 'settings':
            return <Settings onNavigateBack={navigateToDashboard} />;
        default:
            return (
                <Dashboard
                    onNavigateToEditor={navigateToEditor}
                    onNavigateToSettings={navigateToSettings}
                />
            );
    }
};
