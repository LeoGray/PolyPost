// ============================================
// Core Data Types for PolyPost
// ============================================

// Post status enum
export type PostStatus = 'draft' | 'scheduled' | 'posted';

// Variant type enum
export type VariantType = 'polish' | 'translation';

// Polish template names or IDs
export type PolishTemplate = string;
// Was:
// | 'professional'
// | 'viral'
// | 'casual'
// | 'technical'
// | 'emoji'
// | 'concise';

// Supported languages
export type Language = 'en' | 'zh' | 'jp' | 'es' | 'fr' | 'de' | 'ko';

// Language display names
export const LANGUAGE_NAMES: Record<Language, string> = {
    en: 'English',
    zh: '中文',
    jp: '日本語',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    ko: '한국어',
};

// Language short codes for badges
export const LANGUAGE_CODES: Record<Language, string> = {
    en: 'EN',
    zh: 'ZH',
    jp: 'JP',
    es: 'ES',
    fr: 'FR',
    de: 'DE',
    ko: 'KO',
};

// Polish template display names
export const POLISH_TEMPLATE_NAMES: Record<PolishTemplate, string> = {
    professional: 'Professional Polish',
    viral: 'Viral Hook',
    casual: 'Casual Friendly',
    technical: 'Technical Expert',
    emoji: 'Emoji Rich',
    concise: 'Concise Sharp',
};

// ============================================
// Folder
// ============================================
export interface Folder {
    id: string;
    name: string;
    color: string;
    icon?: string;
    createdAt: number;
    updatedAt: number;
}

// ============================================
// Post
// ============================================
export interface Post {
    id: string;
    folderId: string | null;
    sourceContent: string;
    status: PostStatus;
    tags: string[];
    campaignId: string | null;
    createdAt: number;
    updatedAt: number;
    publishedAt: number | null;
}

// ============================================
// Variant
// ============================================
export interface Variant {
    id: string;
    postId: string;
    type: VariantType;
    language: Language | null; // Only for translations
    promptTemplate: PolishTemplate | null; // Only for polish
    content: string;
    aiConfidence: number; // 0-100
    description: string;
    isSelected: boolean;
    createdAt: number;
}

// ============================================
// Settings
// ============================================
// ============================================
// Prompts
// ============================================
export interface PolishPrompt {
    id: string;
    template: string; // was PolishTemplate, now flexible string ID
    name: string;
    description: string;
    content: string;
}

// ============================================
// Settings
// ============================================
export interface Settings {
    openaiApiKey: string;
    provider: 'openai' | 'custom';
    customApiUrl?: string;
    customApiKey?: string;
    defaultLanguage: Language;
    defaultPolishTemplate: string; // Changed from PolishTemplate to string to support custom IDs
    theme: 'dark' | 'light' | 'system';
    uiLanguage: 'en' | 'zh';
    prompts: PolishPrompt[];
}

// ============================================
// UI State
// ============================================
export type ViewMode = 'grid' | 'list';
export type LibraryFilter = 'all' | 'drafts' | 'scheduled' | 'posted';
export type SettingsView = 'general' | 'prompts'; // New type for settings navigation
export type DashboardView = 'posts' | 'prompts' | 'translate';

export interface UIState {
    viewMode: ViewMode;
    libraryFilter: LibraryFilter;
    selectedFolderId: string | null;
    searchQuery: string;
    settingsView: SettingsView; // For sidebar navigation
}

// ============================================
// Tags
// ============================================
export const TAG_COLORS: Record<string, string> = {
    Thread: 'bg-tag-thread',
    Polished: 'bg-tag-polished',
    Viral: 'bg-tag-viral',
    Technical: 'bg-tag-technical',
    Emoji: 'bg-tag-emoji',
    Short: 'bg-tag-short',
};

// Default folder colors
export const FOLDER_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
];
