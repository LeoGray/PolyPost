import React from 'react';
import {
    CheckCircle,
    FileText,
    FileClock,
    Folder,
    Plus,
    Sun,
    Moon,
    Monitor,
    Edit2,
    Trash2,
} from 'lucide-react';
import { useFoldersStore, useUIStore, usePostsStore, useSettingsStore } from '@/store';
import type { LibraryFilter } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';


export const Sidebar: React.FC = () => {
    const { folders } = useFoldersStore();
    const { posts } = usePostsStore();
    const {
        libraryFilter,
        selectedFolderId,
        dashboardView,
        setLibraryFilter,
        setSelectedFolderId,
        setDashboardView,
        openFolderModal,
        openDeleteFolderModal,
    } = useUIStore();
    const { theme, setTheme } = useSettingsStore();

    const { t } = useTranslation();

    const libraryItems: { id: LibraryFilter; label: string; icon: React.ReactNode }[] = [
        { id: 'all', label: t('dashboard.title.all'), icon: <FileText size={18} /> },
        { id: 'drafts', label: t('dashboard.title.drafts'), icon: <FileClock size={18} /> },
        { id: 'posted', label: t('dashboard.title.posted'), icon: <CheckCircle size={18} /> },
    ];

    // Count posts by status
    const draftCount = posts.filter((p) => p.status === 'draft').length;
    const postedCount = posts.filter((p) => p.status === 'posted').length;

    const getCount = (id: LibraryFilter) => {
        switch (id) {
            case 'drafts':
                return draftCount;
            case 'posted':
                return postedCount;
            default:
                return null;
        }
    };

    return (
        <aside className="w-56 h-full bg-bg-primary border-r border-border-primary flex flex-col">
            {/* Logo */}
            <div className="h-16 px-4 border-b border-border-primary flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg">
                    <img src="/icons/icon48.png" alt="PolyPost Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-text-primary font-semibold text-lg">{t('app.name')}</span>
            </div>

            {/* Library Section */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-2 space-y-1">
                    {libraryItems.map((item) => {
                        const count = getCount(item.id);
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setLibraryFilter(item.id);
                                }}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                  transition-colors duration-150
                  ${libraryFilter === item.id && !selectedFolderId
                                        ? 'bg-bg-tertiary text-text-primary'
                                        : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                                    }
                `}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                {count !== null && count > 0 && (
                                    <span className="ml-auto bg-accent/20 text-accent text-xs px-1.5 py-0.5 rounded">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Prompts Section */}
                <div className="mt-6 px-2">
                    <button
                        onClick={() => {
                            setDashboardView('prompts');
                        }}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                            transition-colors duration-150
                            ${dashboardView === 'prompts'
                                ? 'bg-bg-tertiary text-text-primary'
                                : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                            }
                        `}
                    >
                        <div className="flex items-center justify-center w-[18px]">
                            <span className="text-lg leading-none">✨</span>
                        </div>
                        <span>{t('nav.prompts')}</span>
                    </button>
                </div>

                {/* Folders Section */}
                <div className="mt-2 px-2">
                    <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-text-muted text-xs font-medium uppercase tracking-wider">
                            {t('nav.folders')}
                        </span>
                        <button
                            onClick={() => openFolderModal('create')}
                            className="p-1 rounded hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <nav className="space-y-1 mt-2">
                        {folders.map((folder) => {
                            const folderPostCount = posts.filter((p) => p.folderId === folder.id).length;
                            const isSelected = selectedFolderId === folder.id;

                            return (
                                <div
                                    key={folder.id}
                                    className={`
                                        group relative flex items-center w-full rounded-lg transition-colors duration-150
                                        ${isSelected
                                            ? 'bg-bg-tertiary text-text-primary'
                                            : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                                        }
                                    `}
                                >
                                    <button
                                        onClick={() => setSelectedFolderId(folder.id)}
                                        className="flex-1 flex items-center gap-3 px-3 py-2 text-sm overflow-hidden"
                                    >
                                        <Folder size={18} style={{ color: folder.color }} />
                                        <span className="truncate">{folder.name}</span>
                                        {folderPostCount > 0 && (
                                            <span className="ml-auto text-text-muted text-xs">{folderPostCount}</span>
                                        )}
                                    </button>

                                    {/* Folder Actions */}
                                    <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex bg-bg-tertiary rounded shadow-sm border border-border-primary">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openFolderModal('edit', folder.id);
                                                }}
                                                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-l transition-colors"
                                                title={t('actions.edit')}
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <div className="w-[1px] bg-border-primary"></div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteFolderModal(folder.id);
                                                }}
                                                className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-bg-secondary rounded-r transition-colors"
                                                title={t('actions.delete')}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Appearance Switcher */}
            <div className="p-3 border-t border-border-primary">
                <div className="bg-bg-secondary/50 p-1 rounded-lg flex items-center justify-between">
                    <button
                        onClick={() => setTheme('light')}
                        className={`
                            flex-1 flex items-center justify-center p-1.5 rounded-md transition-all duration-200
                            ${theme === 'light'
                                ? 'bg-bg-primary text-accent shadow-sm'
                                : 'text-text-secondary hover:text-text-primary'
                            }
                        `}
                        title="Light Mode"
                    >
                        <Sun size={16} />
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        className={`
                            flex-1 flex items-center justify-center p-1.5 rounded-md transition-all duration-200
                            ${theme === 'dark'
                                ? 'bg-bg-primary text-accent shadow-sm'
                                : 'text-text-secondary hover:text-text-primary'
                            }
                        `}
                        title="Dark Mode"
                    >
                        <Moon size={16} />
                    </button>
                    <button
                        onClick={() => setTheme('system')}
                        className={`
                            flex-1 flex items-center justify-center p-1.5 rounded-md transition-all duration-200
                            ${theme === 'system'
                                ? 'bg-bg-primary text-accent shadow-sm'
                                : 'text-text-secondary hover:text-text-primary'
                            }
                        `}
                        title="System Theme"
                    >
                        <Monitor size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
};
