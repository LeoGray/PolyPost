import React, { useState } from 'react';
import { MoreHorizontal, FolderInput, Trash2 } from 'lucide-react';
import { Card, Badge, Modal, Button } from '@/components/ui';
import type { Post, Variant } from '@/types';
import { truncateText, formatRelativeTime } from '@/utils';
import { LANGUAGE_CODES } from '@/types';
import { useFoldersStore, usePostsStore } from '@/store';

interface PostCardProps {
    post: Post;
    variants: Variant[];
    onClick: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, variants, onClick }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const { folders } = useFoldersStore();
    const { updatePost, deletePost } = usePostsStore();

    // Get unique languages from variants
    const languages = [...new Set(variants.filter((v) => v.language).map((v) => v.language!))]
        .map((lang) => LANGUAGE_CODES[lang])
        .slice(0, 3);

    const statusVariant = {
        draft: 'draft' as const,
        scheduled: 'scheduled' as const,
        posted: 'posted' as const,
    };

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

    const currentFolder = folders.find((f) => f.id === post.folderId);

    return (
        <>
            <Card hoverable onClick={onClick} className="p-4 flex flex-col gap-3 relative">
                {/* Header with status */}
                <div className="flex items-center justify-between">
                    <Badge variant={statusVariant[post.status]}>{post.status.toUpperCase()}</Badge>
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            className="p-1 rounded hover:bg-bg-tertiary text-text-muted"
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

                {/* Content preview */}
                <p className="text-text-primary text-sm leading-relaxed flex-1">
                    {truncateText(post.sourceContent, 120) || 'Empty post...'}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto">
                    {/* Language badges and folder */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {currentFolder && (
                            <Badge
                                variant="tag"
                                className="text-xs"
                                color={currentFolder.color}
                            >
                                {currentFolder.name}
                            </Badge>
                        )}
                        {languages.map((lang) => (
                            <Badge key={lang} variant="language" className="text-xs">
                                {lang}
                            </Badge>
                        ))}
                    </div>

                    {/* Time */}
                    <span className="text-text-muted text-xs whitespace-nowrap ml-2">
                        {formatRelativeTime(post.updatedAt)}
                    </span>
                </div>
            </Card>

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
