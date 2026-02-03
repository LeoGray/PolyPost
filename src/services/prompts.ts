import type { PolishTemplate, Language } from '@/types';

// ============================================
// Polish Prompt Templates
// ============================================
export const POLISH_PROMPTS: Record<PolishTemplate, string> = {
    professional: `You are a professional social media copywriter. Rewrite the following tweet to be more professional and polished while maintaining the core message. Make it suitable for a business or professional audience. Keep it within 280 characters.`,

    viral: `You are a viral content expert. Rewrite the following tweet to maximize engagement and shareability. Use attention-grabbing hooks, create curiosity, and encourage interaction. Keep it within 280 characters.`,

    casual: `You are a friendly social media content creator. Rewrite the following tweet to be more casual, friendly, and approachable. Make it feel like a genuine conversation with friends. Keep it within 280 characters.`,

    technical: `You are a technical expert in the field. Rewrite the following tweet to sound more authoritative and technically accurate. Use precise terminology and establish expertise. Keep it within 280 characters.`,

    emoji: `You are a social media expert who knows how to use emojis effectively. Rewrite the following tweet with strategic emoji placement to enhance readability and emotional impact. Don't overdo it - use 3-5 emojis maximum. Keep it within 280 characters.`,

    concise: `You are a master of brevity. Rewrite the following tweet to be as concise and impactful as possible. Remove all unnecessary words while preserving the core message. Make every word count. Keep it within 280 characters.`,
};

// ============================================
// Translation Prompts
// ============================================
export const TRANSLATION_PROMPT = `请自动识别源语言，并将以下内容翻译成 {language}。
如果包含混合语言，请尽量保留专有名词/术语原文，仅翻译必要部分。

You are a professional translator. Detect the source language automatically and translate the text into {language}.
If the input is mixed-language, keep proper nouns/terms as-is and only translate where appropriate.

Important guidelines:
- Maintain the tone and style of the original
- Adapt cultural references when necessary
- Keep hashtags in their original form or translate if they have common equivalents
- Ensure the translation fits within 280 characters
- Make the translation sound natural to native speakers

Content:
{content}

Translated ({language}):`;

// ============================================
// Language names for prompts
// ============================================
export const LANGUAGE_FULL_NAMES: Record<Language, string> = {
    en: 'English',
    zh: 'Chinese (Simplified)',
    jp: 'Japanese',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    ko: 'Korean',
};

// ============================================
// Helper functions
// ============================================
export function getPolishPrompt(template: PolishTemplate, content: string): string {
    return POLISH_PROMPTS[template].replace('{content}', content);
}

export function getTranslationPrompt(content: string, targetLanguage: Language): string {
    return TRANSLATION_PROMPT.replace(/\{content\}/g, content).replace(
        /\{language\}/g,
        LANGUAGE_FULL_NAMES[targetLanguage],
    );
}

// ============================================
// Template descriptions
// ============================================
export const POLISH_TEMPLATE_DESCRIPTIONS: Record<PolishTemplate, string> = {
    professional: 'Perfect for business content and professional networking',
    viral: 'Optimized for maximum engagement and shares',
    casual: 'Great for personal brand and friendly interactions',
    technical: 'Ideal for industry insights and expert content',
    emoji: 'Enhanced with strategic emoji for visual appeal',
    concise: 'Sharp and impactful, every word matters',
};
