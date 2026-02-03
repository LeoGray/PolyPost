import React, { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { useFoldersStore, useUIStore } from '@/store';

export const DeleteFolderModal: React.FC = () => {
    const { isDeleteFolderModalOpen, closeDeleteFolderModal, folderToDeleteId } = useUIStore();
    const { deleteFolder } = useFoldersStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!folderToDeleteId) return;

        setIsLoading(true);
        try {
            await deleteFolder(folderToDeleteId);
            closeDeleteFolderModal();
        } catch (error) {
            console.error('Failed to delete folder:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isDeleteFolderModalOpen}
            onClose={closeDeleteFolderModal}
            title="Delete Folder"
            size="sm"
        >
            <div className="space-y-4">
                <p className="text-text-secondary">
                    Are you sure you want to delete this folder? Posts in this folder will not be
                    deleted but will be removed from this folder.
                </p>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={closeDeleteFolderModal}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary" // Assuming primary assumes destructive action isn't a variant, or using default style
                        className="bg-red-500 hover:bg-red-600 text-white" // Override for destructive look
                        onClick={handleDelete}
                        isLoading={isLoading}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
