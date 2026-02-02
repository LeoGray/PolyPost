import { create } from 'zustand';
import type { ViewMode, LibraryFilter } from '@/types';

interface UIState {
    viewMode: ViewMode;
    libraryFilter: LibraryFilter;
    selectedFolderId: string | null;
    searchQuery: string;
    currentPage: 'dashboard' | 'editor' | 'settings';
    dashboardView: 'posts' | 'prompts';

    // Modal states
    isFolderModalOpen: boolean;
    folderModalMode: 'create' | 'edit';
    editingFolderId: string | null;
    isDeleteFolderModalOpen: boolean;
    folderToDeleteId: string | null;

    isPolishModalOpen: boolean;
    isTranslateModalOpen: boolean;

    // Actions
    setViewMode: (mode: ViewMode) => void;
    setLibraryFilter: (filter: LibraryFilter) => void;
    setSelectedFolderId: (id: string | null) => void;
    setSearchQuery: (query: string) => void;
    setCurrentPage: (page: 'dashboard' | 'editor' | 'settings') => void;
    setDashboardView: (view: 'posts' | 'prompts') => void;

    // Modal actions
    openFolderModal: (mode?: 'create' | 'edit', folderId?: string) => void;
    closeFolderModal: () => void;
    openDeleteFolderModal: (folderId: string) => void;
    closeDeleteFolderModal: () => void;
    openPolishModal: () => void;
    closePolishModal: () => void;
    openTranslateModal: () => void;
    closeTranslateModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    viewMode: 'grid',
    libraryFilter: 'all',
    selectedFolderId: null,
    searchQuery: '',
    currentPage: 'dashboard',
    dashboardView: 'posts',

    isFolderModalOpen: false,
    folderModalMode: 'create',
    editingFolderId: null,
    isDeleteFolderModalOpen: false,
    folderToDeleteId: null,
    isPolishModalOpen: false,
    isTranslateModalOpen: false,

    setViewMode: (mode) => set({ viewMode: mode }),
    setLibraryFilter: (filter) => set({ libraryFilter: filter, selectedFolderId: null, dashboardView: 'posts' }),
    setSelectedFolderId: (id) => set({ selectedFolderId: id, libraryFilter: 'all', dashboardView: 'posts' }),
    setDashboardView: (view) => set({ dashboardView: view, selectedFolderId: null, libraryFilter: 'all' }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setCurrentPage: (page) => set({ currentPage: page }),

    openFolderModal: (mode = 'create', folderId) => set({
        isFolderModalOpen: true,
        folderModalMode: mode,
        editingFolderId: folderId || null
    }),
    closeFolderModal: () => set({
        isFolderModalOpen: false,
        folderModalMode: 'create',
        editingFolderId: null
    }),
    openDeleteFolderModal: (folderId) => set({
        isDeleteFolderModalOpen: true,
        folderToDeleteId: folderId
    }),
    closeDeleteFolderModal: () => set({
        isDeleteFolderModalOpen: false,
        folderToDeleteId: null
    }),
    openPolishModal: () => set({ isPolishModalOpen: true }),
    closePolishModal: () => set({ isPolishModalOpen: false }),
    openTranslateModal: () => set({ isTranslateModalOpen: true }),
    closeTranslateModal: () => set({ isTranslateModalOpen: false }),
}));
