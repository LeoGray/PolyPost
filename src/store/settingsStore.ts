import { create } from 'zustand';
import type { Settings, Language, PolishPrompt } from '@/types';
import { storage } from '@/services/storage';
import { POLISH_PROMPTS, POLISH_TEMPLATE_DESCRIPTIONS } from '@/services/prompts';
import { POLISH_TEMPLATE_NAMES } from '@/types';

interface SettingsState extends Settings {
    isLoading: boolean;

    // Actions
    loadSettings: () => Promise<void>;
    setOpenaiApiKey: (key: string) => Promise<void>;
    setProvider: (provider: 'openai' | 'custom') => Promise<void>;
    setCustomApiUrl: (url: string) => Promise<void>;
    setCustomApiKey: (key: string) => Promise<void>;
    setDefaultLanguage: (language: Language) => Promise<void>;
    setDefaultPolishTemplate: (template: string) => Promise<void>;
    setTheme: (theme: 'dark' | 'light' | 'system') => Promise<void>;
    setUiLanguage: (language: 'en' | 'zh') => Promise<void>;

    // Prompt Actions
    addPrompt: (prompt: PolishPrompt) => Promise<void>;
    updatePrompt: (prompt: PolishPrompt) => Promise<void>;
    deletePrompt: (id: string) => Promise<void>;
    resetPrompts: () => Promise<void>;
}

// Helper to generate default prompts from constants
const getDefaultPrompts = (): PolishPrompt[] => {
    return Object.entries(POLISH_PROMPTS).map(([key, content]) => ({
        id: key,
        template: key,
        name: POLISH_TEMPLATE_NAMES[key as keyof typeof POLISH_TEMPLATE_NAMES] || key,
        description: POLISH_TEMPLATE_DESCRIPTIONS[key as keyof typeof POLISH_TEMPLATE_DESCRIPTIONS] || '',
        content,
    }));
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
    openaiApiKey: '',
    provider: 'openai',
    customApiUrl: '',
    customApiKey: '',
    defaultLanguage: 'en',
    defaultPolishTemplate: 'professional',
    theme: 'dark',
    uiLanguage: 'en',
    prompts: [], // Will be populated on load
    isLoading: false,

    loadSettings: async () => {
        set({ isLoading: true });
        try {
            const settings = await storage.getSettings();

            // Initialize prompts if they don't exist in storage
            let prompts = settings.prompts;
            if (!prompts || prompts.length === 0) {
                prompts = getDefaultPrompts();
                // We should probably save these defaults to storage immediately so they persist? 
                // Alternatively, component logic decides. Let's save them to ensure consistency.
                // However, we don't want to overwrite if the user actually deleted everything (but logic prevents that).
                // So if it's undefined/null, we set defaults.
            }

            set({ ...settings, prompts, isLoading: false });
        } catch (error) {
            console.error('Failed to load settings:', error);
            // Fallback to defaults
            set({ prompts: getDefaultPrompts(), isLoading: false });
        }
    },

    setOpenaiApiKey: async (key: string) => {
        await storage.updateSettings({ openaiApiKey: key });
        set({ openaiApiKey: key });
    },

    setProvider: async (provider: 'openai' | 'custom') => {
        await storage.updateSettings({ provider });
        set({ provider });
    },

    setCustomApiUrl: async (url: string) => {
        await storage.updateSettings({ customApiUrl: url });
        set({ customApiUrl: url });
    },

    setCustomApiKey: async (key: string) => {
        await storage.updateSettings({ customApiKey: key });
        set({ customApiKey: key });
    },

    setDefaultLanguage: async (language: Language) => {
        await storage.updateSettings({ defaultLanguage: language });
        set({ defaultLanguage: language });
    },

    setDefaultPolishTemplate: async (template: string) => {
        await storage.updateSettings({ defaultPolishTemplate: template });
        set({ defaultPolishTemplate: template });
    },

    setTheme: async (theme: 'dark' | 'light' | 'system') => {
        set({ theme });
        try {
            await storage.updateSettings({ theme });
        } catch (error) {
            console.error('Failed to save theme setting:', error);
        }
    },

    setUiLanguage: async (language: 'en' | 'zh') => {
        await storage.updateSettings({ uiLanguage: language });
        set({ uiLanguage: language });
    },

    addPrompt: async (prompt: PolishPrompt) => {
        const { prompts } = get();
        const newPrompts = [...prompts, prompt];
        set({ prompts: newPrompts });
        await storage.updateSettings({ prompts: newPrompts });
    },

    updatePrompt: async (updatedPrompt: PolishPrompt) => {
        const { prompts } = get();
        const newPrompts = prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p);
        set({ prompts: newPrompts });
        await storage.updateSettings({ prompts: newPrompts });
    },

    deletePrompt: async (id: string) => {
        const { prompts } = get();
        if (prompts.length <= 1) {
            throw new Error('Cannot delete the last prompt');
        }
        const newPrompts = prompts.filter(p => p.id !== id);
        set({ prompts: newPrompts });
        await storage.updateSettings({ prompts: newPrompts });
    },

    resetPrompts: async () => {
        const defaultPrompts = getDefaultPrompts();
        set({ prompts: defaultPrompts });
        await storage.updateSettings({ prompts: defaultPrompts });
    }
}));
