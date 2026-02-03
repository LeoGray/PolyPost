import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { useSettingsStore } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import { aiService, DEFAULT_OPENAI_BASE_URL } from '@/services/ai';
import { ensureHostPermission } from '@/services/permissions';
import type { Language } from '@/types';
import { LANGUAGE_NAMES } from '@/types';

export const QuickTranslate: React.FC = () => {
    const { t } = useTranslation();
    const { defaultLanguage, openaiApiKey, provider, customApiKey, customApiUrl } =
        useSettingsStore();

    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [targetLanguage, setTargetLanguage] = useState<Language>(defaultLanguage);
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setTargetLanguage(defaultLanguage);
    }, [defaultLanguage]);

    const handleTranslate = async () => {
        if (!sourceText.trim()) {
            setError(t('editor.translate_error'));
            return;
        }

        if (provider === 'custom' && !customApiKey) {
            setError(t('editor.api_key_missing_custom'));
            return;
        }
        if (provider !== 'custom' && !openaiApiKey) {
            setError(t('editor.api_key_missing_openai'));
            return;
        }

        const apiKey = provider === 'custom' ? customApiKey : openaiApiKey;
        const baseURL = provider === 'custom' ? customApiUrl : undefined;
        const permissionBaseUrl =
            provider === 'custom' ? customApiUrl || '' : DEFAULT_OPENAI_BASE_URL;

        const permissionResult = await ensureHostPermission(permissionBaseUrl);
        if (!permissionResult.granted) {
            if (permissionResult.reason === 'invalid_url') {
                setError(t('editor.permission.invalid_url'));
            } else if (permissionResult.reason === 'not_allowed') {
                setError(t('editor.permission.not_allowed', permissionResult.origin || ''));
            } else {
                setError(t('editor.permission.denied', permissionResult.origin || ''));
            }
            return;
        }

        if (!apiKey) {
            return;
        }

        setIsTranslating(true);
        setError(null);

        try {
            const result = await aiService.translate(sourceText, targetLanguage, apiKey, baseURL);
            setTranslatedText(result.content);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('editor.translate_fail'));
        } finally {
            setIsTranslating(false);
        }
    };

    const handleCopy = async () => {
        if (!translatedText) {
            return;
        }

        if (!navigator?.clipboard?.writeText) {
            console.warn('Clipboard API is not available.');
            return;
        }

        try {
            await navigator.clipboard.writeText(translatedText);
        } catch (error) {
            console.error('Failed to copy translation:', error);
        }
    };

    const handleClear = () => {
        setSourceText('');
        setTranslatedText('');
        setError(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">
                    {t('quick_translate.title')}
                </h1>
                <p className="text-text-muted mt-1">{t('quick_translate.subtitle')}</p>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <label className="block text-sm font-medium text-text-primary">
                        {t('quick_translate.target_language')}
                    </label>
                    <p className="text-xs text-text-muted mt-1">
                        {t('editor.translate.auto_detect')}
                    </p>
                </div>
                <select
                    value={targetLanguage}
                    onChange={(event) => setTargetLanguage(event.target.value as Language)}
                    className="min-w-[180px] px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                    {Object.entries(LANGUAGE_NAMES).map(([lang, label]) => (
                        <option key={lang} value={lang}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-primary">
                        {t('quick_translate.source.label')}
                    </label>
                    <textarea
                        value={sourceText}
                        onChange={(event) => {
                            setSourceText(event.target.value);
                            setError(null);
                        }}
                        placeholder={t('quick_translate.source.placeholder')}
                        className="min-h-[220px] w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-xl
            text-text-primary placeholder-text-muted text-sm
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            resize-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-primary">
                        {t('quick_translate.target.label')}
                    </label>
                    <textarea
                        readOnly
                        value={translatedText}
                        placeholder={t('quick_translate.target.placeholder')}
                        className="min-h-[220px] w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-xl
            text-text-primary placeholder-text-muted text-sm
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            resize-none"
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleTranslate} isLoading={isTranslating}>
                    {t('quick_translate.translate')}
                </Button>
                <Button
                    variant="secondary"
                    onClick={handleClear}
                    disabled={!sourceText && !translatedText}
                >
                    {t('quick_translate.clear')}
                </Button>
                <Button variant="ghost" onClick={handleCopy} disabled={!translatedText}>
                    {t('actions.copy')}
                </Button>
            </div>
        </div>
    );
};
