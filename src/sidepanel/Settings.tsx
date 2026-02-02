import React, { useState } from 'react';
import { ArrowLeft, Key, Globe, Palette, Laptop } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useSettingsStore } from '@/store';
import type { Language } from '@/types';
import { LANGUAGE_NAMES, POLISH_TEMPLATE_NAMES } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface SettingsProps {
    onNavigateBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onNavigateBack }) => {
    const {
        openaiApiKey,
        provider,
        customApiUrl,
        customApiKey,
        defaultLanguage,
        defaultPolishTemplate,
        theme,
        uiLanguage,
        prompts,
        setOpenaiApiKey,
        setProvider,
        setCustomApiUrl,
        setCustomApiKey,
        setDefaultLanguage,
        setDefaultPolishTemplate,
        setTheme,
        setUiLanguage,
    } = useSettingsStore();

    const { t } = useTranslation();
    const promptOptions = prompts.length
        ? prompts.map((prompt) => ({ id: prompt.id, name: prompt.name }))
        : Object.entries(POLISH_TEMPLATE_NAMES).map(([id, name]) => ({ id, name }));

    const [settings, setSettings] = useState({
        provider: provider || 'openai',
        openaiApiKey: openaiApiKey || '',
        customApiUrl: customApiUrl || '',
        customApiKey: customApiKey || '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    // Update local state when store changes (e.g. initial load)
    React.useEffect(() => {
        setSettings({
            provider: provider || 'openai',
            openaiApiKey: openaiApiKey || '',
            customApiUrl: customApiUrl || '',
            customApiKey: customApiKey || '',
        });
    }, [provider, openaiApiKey, customApiUrl, customApiKey]);

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await setProvider(settings.provider);
            await setOpenaiApiKey(settings.openaiApiKey);
            await setCustomApiUrl(settings.customApiUrl);
            await setCustomApiKey(settings.customApiKey);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-bg-primary">
            {/* Header */}
            <header className="h-14 border-b border-border-primary flex items-center px-4">
                <button
                    onClick={onNavigateBack}
                    className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="ml-4 text-lg font-semibold text-text-primary">{t('settings.title')}</h1>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
                {/* AI Configuration */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Key size={20} className="text-accent" />
                        <h2 className="text-lg font-semibold text-text-primary">{t('settings.ai.title')}</h2>
                    </div>

                    <div className="space-y-4 bg-bg-secondary rounded-xl p-4 border border-border-primary">
                        {/* Provider Selection */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                {t('settings.provider.label')}
                            </label>
                            <select
                                value={settings.provider}
                                onChange={(e) => setSettings({ ...settings, provider: e.target.value as 'openai' | 'custom' })}
                                className="w-full px-4 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary"
                            >
                                <option value="openai">{t('settings.provider.openai')}</option>
                                <option value="custom">{t('settings.provider.custom')}</option>
                            </select>
                            <p className="text-xs text-text-muted mt-2">
                                {t('settings.permission_hint')}
                            </p>
                        </div>

                        {settings.provider === 'openai' ? (
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    {t('settings.apikey.label')}
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type={showApiKey ? 'text' : 'password'}
                                        value={settings.openaiApiKey}
                                        onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                                        placeholder={t('settings.apikey.placeholder')}
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="ghost"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                    >
                                        {showApiKey ? t('settings.hide') : t('settings.show')}
                                    </Button>
                                </div>
                                <p className="text-xs text-text-muted mt-2">
                                    {t('settings.apikey.help')}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        {t('settings.customUrl.label')}
                                    </label>
                                    <Input
                                        type="text"
                                        value={settings.customApiUrl}
                                        onChange={(e) => setSettings({ ...settings, customApiUrl: e.target.value })}
                                        placeholder={t('settings.customUrl.placeholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        {t('settings.customKey.label')}
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            type={showApiKey ? 'text' : 'password'}
                                            value={settings.customApiKey}
                                            onChange={(e) => setSettings({ ...settings, customApiKey: e.target.value })}
                                            placeholder={t('settings.customKey.placeholder')}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                        >
                                            {showApiKey ? t('settings.hide') : t('settings.show')}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button onClick={handleSaveSettings} isLoading={isSaving}>
                                {t('settings.save')}
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Default Preferences */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe size={20} className="text-accent" />
                        <h2 className="text-lg font-semibold text-text-primary">{t('settings.defaults.title')}</h2>
                    </div>

                    <div className="space-y-4 bg-bg-secondary rounded-xl p-4 border border-border-primary">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                {t('settings.language.label')}
                            </label>
                            <select
                                value={uiLanguage}
                                onChange={(e) => setUiLanguage(e.target.value as 'en' | 'zh')}
                                className="w-full px-4 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary"
                            >
                                <option value="en">English</option>
                                <option value="zh">中文</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                {t('settings.translation.label')}
                            </label>
                            <select
                                value={defaultLanguage}
                                onChange={(e) => setDefaultLanguage(e.target.value as Language)}
                                className="w-full px-4 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary"
                            >
                                {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                                    <option key={code} value={code}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                {t('settings.template.label')}
                            </label>
                            <select
                                value={defaultPolishTemplate}
                                onChange={(e) => setDefaultPolishTemplate(e.target.value)}
                                className="w-full px-4 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary"
                            >
                                {promptOptions.map((prompt) => (
                                    <option key={prompt.id} value={prompt.id}>
                                        {prompt.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Appearance */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Palette size={20} className="text-accent" />
                        <h2 className="text-lg font-semibold text-text-primary">{t('settings.appearance.title')}</h2>
                    </div>

                    <div className="space-y-4 bg-bg-secondary rounded-xl p-4 border border-border-primary">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                {t('settings.theme.label')}
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 ${theme === 'light'
                                        ? 'border-accent bg-accent/10 text-text-primary'
                                        : 'border-border-primary text-text-muted hover:border-text-muted'
                                        }`}
                                >
                                    <span>☀️</span> {t('settings.theme.light')}
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 ${theme === 'dark'
                                        ? 'border-accent bg-accent/10 text-text-primary'
                                        : 'border-border-primary text-text-muted hover:border-text-muted'
                                        }`}
                                >
                                    <span>🌙</span> {t('settings.theme.dark')}
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 ${theme === 'system'
                                        ? 'border-accent bg-accent/10 text-text-primary'
                                        : 'border-border-primary text-text-muted hover:border-text-muted'
                                        }`}
                                >
                                    <Laptop size={16} /> {t('settings.theme.system')}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
