import React, { useState } from 'react';
import { Plus, MoreHorizontal, FolderInput, Trash2 } from 'lucide-react';
import { PostCard } from './PostCard';
import { Badge, Modal, Button } from '@/components/ui';
import type { Post, Variant } from '@/types';
import { useUIStore, useFoldersStore, usePostsStore } from '@/store';
import { truncateText, formatRelativeTime } from '@/utils';
import { LANGUAGE_CODES } from '@/types';

interface PostGridProps {
    posts: Post[];
    variants: Variant[];
    onPostClick: (postId: string) => void;
    onCreateNew: () => void;
}

// List item component with menu
const PostListItem: React.FC<{
    post: Post;
    variants: Variant[];
    onClick: () => void;
}> = ({ post, variants, onClick }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const { folders } = useFoldersStore();
    const { updatePost, deletePost } = usePostsStore();

    const languages = [...new Set(variants.filter((v) => v.language).map((v) => v.language!))]
        .map((lang) => LANGUAGE_CODES[lang])
        .slice(0, 2);
    const currentFolder = folders.find((f) => f.id === post.folderId);

    const handleMoveToFolder = async (folderId: string | null) => {
        await updatePost(post.id, { folderId });
        setShowMoveModal(false);
        setShowMenu(false);
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this post?')) {
            await deletePost(post.id);
        }
        setShowMenu(false);
    };

    return (
        <>
            <div
                onClick={onClick}
                className="flex items-center gap-4 px-4 py-3 bg-bg-secondary hover:bg-bg-tertiary border border-border-primary rounded-lg cursor-pointer transition-colors"
            >
                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm truncate">
                        {truncateText(post.sourceContent, 80) || 'Empty post...'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                        {languages.map((lang) => (
                            <Badge key={lang} variant="language" className="text-xs">
                                {lang}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Status */}
                <div className="w-20">
                    <Badge
                        variant={post.status === 'draft' ? 'draft' : post.status === 'posted' ? 'posted' : 'scheduled'}
                    >
                        {post.status}
                    </Badge>
                </div>

                {/* Folder */}
                <div className="w-24">
                    {currentFolder ? (
                        <span className="text-xs text-text-secondary flex items-center gap-1">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: currentFolder.color }} />
                            {currentFolder.name}
                        </span>
                    ) : (
                        <span className="text-xs text-text-muted">—</span>
                    )}
                </div>

                {/* Updated */}
                <div className="w-24 text-xs text-text-muted">
                    {formatRelativeTime(post.updatedAt)}
                </div>

                {/* Actions */}
                <div className="w-8 relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-1 rounded hover:bg-bg-primary text-text-muted"
                    >
                        <MoreHorizontal size={16} />
                    </button>

                    {/* Dropdown menu */}
                    {showMenu && (
                        <div
                            className="absolute right-0 top-full mt-1 w-40 bg-bg-secondary border border-border-primary rounded-lg shadow-lg z-10 py-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => {
                                    setShowMoveModal(true);
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-tertiary"
                            >
                                <FolderInput size={14} />
                                Move to folder
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-bg-tertiary"
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Move to folder modal */}
            <Modal
                isOpen={showMoveModal}
                onClose={() => setShowMoveModal(false)}
                title="Move to Folder"
                size="sm"
            >
                <div className="space-y-2">
                    <button
                        onClick={() => handleMoveToFolder(null)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left
              ${!post.folderId ? 'bg-accent/10 text-accent' : 'text-text-primary hover:bg-bg-tertiary'}`}
                    >
                        No folder
                    </button>
                    {folders.map((folder) => (
                        <button
                            key={folder.id}
                            onClick={() => handleMoveToFolder(folder.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left
                ${post.folderId === folder.id ? 'bg-accent/10 text-accent' : 'text-text-primary hover:bg-bg-tertiary'}`}
                        >
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: folder.color }} />
                            {folder.name}
                        </button>
                    ))}
                </div>
                <div className="flex justify-end mt-4">
                    <Button variant="ghost" onClick={() => setShowMoveModal(false)}>
                        Cancel
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export const PostGrid: React.FC<PostGridProps> = ({
    posts,
    variants,
    onPostClick,
    onCreateNew,
}) => {
    const { viewMode } = useUIStore();

    const getVariantsForPost = (postId: string) => {
        return variants.filter((v) => v.postId === postId);
    };

    // Grid view
    if (viewMode === 'grid') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        variants={getVariantsForPost(post.id)}
                        onClick={() => onPostClick(post.id)}
                    />
                ))}

                {/* Create new post card */}
                <button
                    onClick={onCreateNew}
                    className="
            min-h-[180px] rounded-xl border-2 border-dashed border-border-primary
            flex flex-col items-center justify-center gap-2
            text-text-muted hover:text-text-primary hover:border-accent
            transition-colors duration-200
          "
                >
                    <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center">
                        <Plus size={24} />
                    </div>
                    <span className="text-sm">Create new post</span>
                </button>
            </div>
        );
    }

    // List view
    return (
        <div className="flex flex-col gap-2">
            {/* List header */}
            <div className="flex items-center gap-4 px-4 py-2 text-xs text-text-muted font-medium uppercase">
                <div className="flex-1">Content</div>
                <div className="w-20">Status</div>
                <div className="w-24">Folder</div>
                <div className="w-24">Updated</div>
                <div className="w-8"></div>
            </div>

            {posts.map((post) => (
                <PostListItem
                    key={post.id}
                    post={post}
                    variants={getVariantsForPost(post.id)}
                    onClick={() => onPostClick(post.id)}
                />
            ))}

            {/* Create new button */}
            <button
                onClick={onCreateNew}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border-primary rounded-lg text-text-muted hover:text-text-primary hover:border-accent transition-colors"
            >
                <Plus size={18} />
                <span className="text-sm">Create new post</span>
            </button>
        </div>
    );
};
