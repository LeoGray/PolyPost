import type { Post, Variant, Folder, Settings } from '@/types';

// Storage keys
const STORAGE_KEYS = {
    POSTS: 'polypost_posts',
    VARIANTS: 'polypost_variants',
    FOLDERS: 'polypost_folders',
    SETTINGS: 'polypost_settings',
} as const;

// Helper to check if chrome storage is available
const isExtensionEnv = typeof chrome !== 'undefined' && !!chrome.storage;

/**
 * Chrome Storage API wrapper for data persistence
 * Includes fallback to localStorage for web development
 */
export const storage = {
    // ============================================
    // Posts
    // ============================================
    async getPosts(): Promise<Post[]> {
        const result = await chrome.storage.local.get(STORAGE_KEYS.POSTS);
        return result[STORAGE_KEYS.POSTS] || [];
    },

    async savePosts(posts: Post[]): Promise<void> {
        await chrome.storage.local.set({ [STORAGE_KEYS.POSTS]: posts });
    },

    async addPost(post: Post): Promise<void> {
        const posts = await this.getPosts();
        posts.push(post);
        await this.savePosts(posts);
    },

    async updatePost(id: string, updates: Partial<Post>): Promise<void> {
        const posts = await this.getPosts();
        const index = posts.findIndex(p => p.id === id);
        if (index !== -1) {
            posts[index] = { ...posts[index], ...updates, updatedAt: Date.now() };
            await this.savePosts(posts);
        }
    },

    async deletePost(id: string): Promise<void> {
        const posts = await this.getPosts();
        const filtered = posts.filter(p => p.id !== id);
        await this.savePosts(filtered);
        // Also delete associated variants
        const variants = await this.getVariants();
        const filteredVariants = variants.filter(v => v.postId !== id);
        await this.saveVariants(filteredVariants);
    },

    // ============================================
    // Variants
    // ============================================
    async getVariants(): Promise<Variant[]> {
        const result = await chrome.storage.local.get(STORAGE_KEYS.VARIANTS);
        return result[STORAGE_KEYS.VARIANTS] || [];
    },

    async saveVariants(variants: Variant[]): Promise<void> {
        await chrome.storage.local.set({ [STORAGE_KEYS.VARIANTS]: variants });
    },

    async addVariant(variant: Variant): Promise<void> {
        const variants = await this.getVariants();
        variants.push(variant);
        await this.saveVariants(variants);
    },

    async getVariantsByPostId(postId: string): Promise<Variant[]> {
        const variants = await this.getVariants();
        return variants.filter(v => v.postId === postId);
    },

    async deleteVariant(id: string): Promise<void> {
        const variants = await this.getVariants();
        const filtered = variants.filter(v => v.id !== id);
        await this.saveVariants(filtered);
    },

    async updateVariant(id: string, updates: Partial<Variant>): Promise<void> {
        const variants = await this.getVariants();
        const index = variants.findIndex(v => v.id === id);
        if (index !== -1) {
            variants[index] = { ...variants[index], ...updates };
            await this.saveVariants(variants);
        }
    },

    // ============================================
    // Folders
    // ============================================
    async getFolders(): Promise<Folder[]> {
        const result = await chrome.storage.local.get(STORAGE_KEYS.FOLDERS);
        return result[STORAGE_KEYS.FOLDERS] || [];
    },

    async saveFolders(folders: Folder[]): Promise<void> {
        await chrome.storage.local.set({ [STORAGE_KEYS.FOLDERS]: folders });
    },

    async addFolder(folder: Folder): Promise<void> {
        const folders = await this.getFolders();
        folders.push(folder);
        await this.saveFolders(folders);
    },

    async updateFolder(id: string, updates: Partial<Folder>): Promise<void> {
        const folders = await this.getFolders();
        const index = folders.findIndex(f => f.id === id);
        if (index !== -1) {
            folders[index] = { ...folders[index], ...updates, updatedAt: Date.now() };
            await this.saveFolders(folders);
        }
    },

    async deleteFolder(id: string): Promise<void> {
        const folders = await this.getFolders();
        const filtered = folders.filter(f => f.id !== id);
        await this.saveFolders(filtered);
        // Move posts in this folder to uncategorized
        const posts = await this.getPosts();
        const updatedPosts = posts.map(p =>
            p.folderId === id ? { ...p, folderId: null, updatedAt: Date.now() } : p
        );
        await this.savePosts(updatedPosts);
    },

    // ============================================
    // Settings
    // ============================================
    async getSettings(): Promise<Settings> {
        if (isExtensionEnv) {
            const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
            return result[STORAGE_KEYS.SETTINGS] || {
                openaiApiKey: '',
                defaultLanguage: 'en',
                defaultPolishTemplate: 'professional',
                theme: 'dark',
            };
        }

        // Fallback for web dev
        const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return stored ? JSON.parse(stored) : {
            openaiApiKey: '',
            defaultLanguage: 'en',
            defaultPolishTemplate: 'professional',
            theme: 'dark',
        };
    },

    async saveSettings(settings: Settings): Promise<void> {
        if (isExtensionEnv) {
            await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: settings });
            return;
        }
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    async updateSettings(updates: Partial<Settings>): Promise<void> {
        const settings = await this.getSettings();
        await this.saveSettings({ ...settings, ...updates });
    },
};
