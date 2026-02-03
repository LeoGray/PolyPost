import React, { useEffect, useMemo } from 'react';
import { Sidebar, Header } from '@/components/layout';
import { PostGrid, FolderModal, DeleteFolderModal } from '@/components/library';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';
import { PromptSettings } from './PromptSettings';
import { QuickTranslate } from './QuickTranslate';
import { usePostsStore, useFoldersStore, useUIStore } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';

interface DashboardProps {
    onNavigateToEditor: (postId?: string) => void;
    onNavigateToSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
    onNavigateToEditor,
    onNavigateToSettings,
}) => {
    const { posts, variants, loadPosts, createPost, setCurrentPost, isLoading } = usePostsStore();
    const { folders, loadFolders } = useFoldersStore();
    const { libraryFilter, selectedFolderId, searchQuery, dashboardView } = useUIStore();
    const { t } = useTranslation();

    // Load data on mount
    useEffect(() => {
        loadPosts();
        loadFolders();
    }, [loadPosts, loadFolders]);

    // Filter posts
    const filteredPosts = useMemo(() => {
        let result = posts;

        // Filter by folder
        if (selectedFolderId) {
            result = result.filter((p) => p.folderId === selectedFolderId);
        } else {
            // Filter by status
            switch (libraryFilter) {
                case 'drafts':
                    result = result.filter((p) => p.status === 'draft');
                    break;
                case 'scheduled':
                    result = result.filter((p) => p.status === 'scheduled');
                    break;
                case 'posted':
                    result = result.filter((p) => p.status === 'posted');
                    break;
            }
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((p) => p.sourceContent.toLowerCase().includes(query));
        }

        // Sort by updated date
        return result.sort((a, b) => b.updatedAt - a.updatedAt);
    }, [posts, selectedFolderId, libraryFilter, searchQuery]);

    const handlePostClick = (postId: string) => {
        setCurrentPost(postId);
        onNavigateToEditor(postId);
    };

    const handleCreateNew = async () => {
        const post = await createPost('', selectedFolderId);
        setCurrentPost(post.id);
        onNavigateToEditor(post.id);
    };

    const getPageTitle = () => {
        if (selectedFolderId) {
            const folder = folders.find((f) => f.id === selectedFolderId);
            return folder?.name || 'Folder';
        }
        switch (libraryFilter) {
            case 'drafts':
                return t('dashboard.title.drafts');
            case 'scheduled':
                return t('dashboard.title.scheduled');
            case 'posted':
                return t('dashboard.title.posted');
            default:
                return t('dashboard.title.all');
        }
    };

    const isTranslateView = dashboardView === 'translate';

    return (
        <div className="flex h-screen bg-bg-primary">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    onNewPost={handleCreateNew}
                    onSettings={onNavigateToSettings}
                    showNewPost={false}
                    showSearch={!isTranslateView}
                    showViewToggle={!isTranslateView}
                />

                <main className="flex-1 overflow-y-auto p-6">
                    {/* Page header - Hide for prompts view as it handles its own header */}
                    {dashboardView === 'posts' && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-text-primary">
                                    {getPageTitle()}
                                </h1>
                                <Button
                                    onClick={handleCreateNew}
                                    leftIcon={<Plus size={18} />}
                                    size="sm"
                                >
                                    {t('nav.new_post')}
                                </Button>
                            </div>
                            <p className="text-text-muted mt-1">{t('dashboard.subtitle')}</p>
                        </div>
                    )}

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
                        </div>
                    ) : dashboardView === 'prompts' ? (
                        <PromptSettings />
                    ) : dashboardView === 'translate' ? (
                        <QuickTranslate />
                    ) : (
                        <PostGrid
                            posts={filteredPosts}
                            variants={variants}
                            onPostClick={handlePostClick}
                            onCreateNew={handleCreateNew}
                        />
                    )}
                </main>
            </div>

            {/* Modals */}
            <FolderModal />
            <DeleteFolderModal />
        </div>
    );
};
