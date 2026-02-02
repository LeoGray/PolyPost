import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { useFoldersStore, useUIStore } from '@/store';
import { FOLDER_COLORS } from '@/types';

export const FolderModal: React.FC = () => {
    const { isFolderModalOpen, closeFolderModal, folderModalMode, editingFolderId } = useUIStore();
    const { createFolder, updateFolder, folders } = useFoldersStore();

    // Initial state setup
    const initialColor = FOLDER_COLORS[0];
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [isLoading, setIsLoading] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (isFolderModalOpen && folderModalMode === 'edit' && editingFolderId) {
            const folder = folders.find(f => f.id === editingFolderId);
            if (folder) {
                setName(folder.name);
                setSelectedColor(folder.color);
            }
        } else if (isFolderModalOpen && folderModalMode === 'create') {
            // For new folders, try to pick an unused color
            const usedColors = folders.map((f) => f.color);
            const availableColors = FOLDER_COLORS.filter((c) => !usedColors.includes(c));
            setName('');
            setSelectedColor(availableColors[0] || initialColor);
        }
    }, [isFolderModalOpen, folderModalMode, editingFolderId, folders]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            if (folderModalMode === 'edit' && editingFolderId) {
                await updateFolder(editingFolderId, {
                    name: name.trim(),
                    color: selectedColor
                });
            } else {
                await createFolder(name.trim(), selectedColor);
            }
            handleClose();
        } catch (error) {
            console.error('Failed to save folder:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setSelectedColor(initialColor);
        closeFolderModal();
    };

    const title = folderModalMode === 'create' ? 'New Folder' : 'Edit Folder';
    const submitText = folderModalMode === 'create' ? 'Create Folder' : 'Save Changes';

    return (
        <Modal isOpen={isFolderModalOpen} onClose={handleClose} title={title} size="sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Folder Name"
                    placeholder="Enter folder name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {FOLDER_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setSelectedColor(color)}
                                className={`
                  w-8 h-8 rounded-lg transition-all
                  ${selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-secondary' : ''}
                `}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading} disabled={!name.trim()}>
                        {submitText}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
