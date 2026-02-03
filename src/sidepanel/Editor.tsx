import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui';
import { SourceEditor, VariantsPanel, PolishModal, TranslateModal } from '@/components/editor';
import { usePostsStore, useSettingsStore, useUIStore } from '@/store';
import { aiService, DEFAULT_OPENAI_BASE_URL } from '@/services/ai';
import { ensureHostPermission } from '@/services/permissions';
import { twitterService } from '@/services/twitter';
import type { PolishTemplate, Language } from '@/types';
import { LANGUAGE_NAMES, POLISH_TEMPLATE_NAMES } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface EditorProps {
    onNavigateBack: () => void;
}

export const Editor: React.FC<EditorProps> = ({ onNavigateBack }) => {
    const { t } = useTranslation();
    const { currentPostId, getPostById, updatePost, addVariant, selectVariant, deleteVariant } =
        usePostsStore();
    const variants = usePostsStore((s) => s.getVariantsByPostId(currentPostId || ''));
    const { openaiApiKey, provider, customApiKey, customApiUrl, prompts, defaultLanguage } =
        useSettingsStore();
    const {
        isPolishModalOpen,
        isTranslateModalOpen,
        openPolishModal,
        closePolishModal,
        openTranslateModal,
        closeTranslateModal,
    } = useUIStore();

    const post = currentPostId ? getPostById(currentPostId) : null;
    const [content, setContent] = useState(post?.sourceContent || '');
    const [isPolishing, setIsPolishing] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationProgress, setTranslationProgress] = useState<{
        completed: number;
        total: number;
        currentLabel?: string;
    } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const contentRef = useRef(content);
    const hasUnsavedChangesRef = useRef(hasUnsavedChanges);

    // Fix: Redefine getAiSettings to use explicit checks inside handlers or just simple strings if not added to locale
    // The previous implementation returned an object with errorMsg.
    // I haven't added keys for "Please configure your OpenAI API key in Settings".
    // I should probably add them or just use a generic 'editor.save_error' which is "Please enter some content..." - NOT GOOD.

    // Let's stick to the plan: "Replace hardcoded strings".
    // I missed these specific error messages in my `replace_file_content` for locales.
    // I will use a fallback string or just keep them hardcoded if I missed them?
    // No, I should fix it. CONSTANTS?
    // Actually, let's look at `en.ts` again.
    // I added `editor.save_error`.

    // Let's modify `getAiSettings` logic slightly or just use hardcoded strings wrapped in t() if I added them.
    // I didn't add them. I will add them in a separate step or just use `editor.polish_fail` style.

    // Let's use 'settings.apikey.help' for now ? No.
    // I'll leave the errorMsg logic inline in handlePolish/handleTranslate to be cleaner and use newly added keys if possible?
    // I'll use `t('settings.ai.title')` + " missing" ?

    // Let's RE-READ `en.ts` content I wrote.
    // I wrote keys for `editor.save_error`, `editor.polish_error`, etc.
    // But not for "Please configure your OpenAI API key".

    // I will use hardcoded strings for now for these specific configuration errors to avoid breaking flow,
    // OR BETTER: I will add them to the locales in a quick follow up or just use a generic "AI Configuration Error".

    // Let's proceed with replacing the main UI elements first.

    // Get selected variant content (if any)
    const selectedVariant = variants.find((v) => v.isSelected);
    const contentToPublish = selectedVariant?.content || content;
    const getPromptName = (templateId?: string | null) => {
        if (!templateId) return 'Variant';
        const prompt = prompts.find((item) => item.id === templateId);
        if (prompt?.name) return prompt.name;
        return (
            POLISH_TEMPLATE_NAMES[templateId as keyof typeof POLISH_TEMPLATE_NAMES] || templateId
        );
    };

    const selectedVariantLabel = selectedVariant
        ? selectedVariant.type === 'translation' && selectedVariant.language
            ? LANGUAGE_NAMES[selectedVariant.language]
            : getPromptName(selectedVariant.promptTemplate)
        : '';

    // Update content when post changes
    useEffect(() => {
        if (post) {
            setContent(post.sourceContent);
            setHasUnsavedChanges(false);
        }
    }, [post]);

    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    useEffect(() => {
        hasUnsavedChangesRef.current = hasUnsavedChanges;
    }, [hasUnsavedChanges]);

    // Save on unmount or when switching posts
    useEffect(() => {
        return () => {
            if (hasUnsavedChangesRef.current && currentPostId && contentRef.current) {
                updatePost(currentPostId, { sourceContent: contentRef.current });
            }
        };
    }, [currentPostId, updatePost]);

    const handleContentChange = (newContent: string) => {
        setContent(newContent);
        setError(null);
        setHasUnsavedChanges(true);
    };

    const handleBlur = useCallback(async () => {
        if (!currentPostId || !hasUnsavedChanges) return;
        try {
            await updatePost(currentPostId, { sourceContent: content });
            setHasUnsavedChanges(false);
        } catch (err) {
            console.error('Save on blur failed:', err);
        }
    }, [currentPostId, content, hasUnsavedChanges, updatePost]);

    const handleSave = async () => {
        if (!currentPostId) return;
        setIsSaving(true);
        try {
            await updatePost(currentPostId, { sourceContent: content });
            setHasUnsavedChanges(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleNavigateBack = async () => {
        if (hasUnsavedChanges && currentPostId) {
            await updatePost(currentPostId, { sourceContent: content });
        }
        onNavigateBack();
    };

    const handlePublish = () => {
        if (!contentToPublish.trim()) {
            setError(t('editor.save_error'));
            return;
        }

        // Open Twitter Web Intent with the content
        twitterService.openTweetIntent({
            text: contentToPublish,
        });

        // Mark as posted after opening intent
        if (currentPostId) {
            updatePost(currentPostId, { status: 'posted' });
        }
    };

    const handlePolish = async (templateId: PolishTemplate) => {
        if (!content.trim()) {
            setError(t('editor.polish_error'));
            return;
        }

        const { prompts } = useSettingsStore.getState();
        const selectedPrompt = prompts.find((p) => p.id === templateId);

        if (!selectedPrompt) {
            setError(t('editor.polish_prompt_error'));
            return;
        }

        // Logic for checking API key
        if (provider === 'custom' && !customApiKey) {
            setError(t('editor.api_key_missing_custom'));
            closePolishModal();
            return;
        }
        if (provider !== 'custom' && !openaiApiKey) {
            setError(t('editor.api_key_missing_openai'));
            closePolishModal();
            return;
        }

        const apiKey = provider === 'custom' ? customApiKey : openaiApiKey;
        const baseURL = provider === 'custom' ? customApiUrl : undefined;
        const permissionBaseUrl =
            provider === 'custom' ? customApiUrl || '' : DEFAULT_OPENAI_BASE_URL;

        if (!apiKey) {
            // Should not happen due to checks above
            return;
        }

        const permissionResult = await ensureHostPermission(permissionBaseUrl);
        if (!permissionResult.granted) {
            if (permissionResult.reason === 'invalid_url') {
                setError(t('editor.permission.invalid_url'));
            } else if (permissionResult.reason === 'not_allowed') {
                setError(t('editor.permission.not_allowed', permissionResult.origin || ''));
            } else {
                setError(t('editor.permission.denied', permissionResult.origin || ''));
            }
            closePolishModal();
            return;
        }

        setIsPolishing(true);
        setError(null);

        try {
            const result = await aiService.polish(content, selectedPrompt.content, apiKey, baseURL);

            const newVariant = await addVariant({
                postId: currentPostId!,
                type: 'polish',
                language: null,
                promptTemplate: templateId,
                content: result.content,
                aiConfidence: result.confidence,
                description: selectedPrompt.description || result.description,
                isSelected: false,
            });
            await selectVariant(newVariant.id);

            closePolishModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('editor.polish_fail'));
        } finally {
            setIsPolishing(false);
        }
    };

    const handleTranslate = async (
        targetLanguages: Language[],
        sourceMode: 'source' | 'selected',
    ) => {
        const sourceContent =
            sourceMode === 'selected' && selectedVariant?.content
                ? selectedVariant.content
                : content;

        if (!sourceContent.trim()) {
            setError(t('editor.translate_error'));
            return;
        }

        if (targetLanguages.length === 0) {
            return;
        }

        // Logic for checking API key
        if (provider === 'custom' && !customApiKey) {
            setError(t('editor.api_key_missing_custom'));
            closeTranslateModal();
            return;
        }
        if (provider !== 'custom' && !openaiApiKey) {
            setError(t('editor.api_key_missing_openai'));
            closeTranslateModal();
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
            closeTranslateModal();
            return;
        }

        setIsTranslating(true);
        setError(null);
        setTranslationProgress({ completed: 0, total: targetLanguages.length });

        try {
            let completed = 0;
            for (const targetLanguage of targetLanguages) {
                setTranslationProgress({
                    completed,
                    total: targetLanguages.length,
                    currentLabel: LANGUAGE_NAMES[targetLanguage] || targetLanguage,
                });
                const result = await aiService.translate(
                    sourceContent,
                    targetLanguage,
                    apiKey!,
                    baseURL,
                );

                const newVariant = await addVariant({
                    postId: currentPostId!,
                    type: 'translation',
                    language: targetLanguage,
                    promptTemplate: null,
                    content: result.content,
                    aiConfidence: result.confidence,
                    description: result.description,
                    isSelected: false,
                });
                await selectVariant(newVariant.id);

                completed += 1;
                setTranslationProgress({
                    completed,
                    total: targetLanguages.length,
                    currentLabel: LANGUAGE_NAMES[targetLanguage] || targetLanguage,
                });
            }

            closeTranslateModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('editor.translate_fail'));
        } finally {
            setIsTranslating(false);
            setTranslationProgress(null);
        }
    };

    const handleSelectVariant = async (variantId: string) => {
        await selectVariant(variantId);
    };

    const handleDeleteVariant = async (variantId: string) => {
        await deleteVariant(variantId);
    };

    return (
        <div className="flex flex-col h-screen bg-bg-primary">
            {/* Header */}
            <header className="h-14 border-b border-border-primary flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleNavigateBack}
                        className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary"
                    >
                        <ArrowLeft size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {/* Selected variant indicator */}
                    {selectedVariant && (
                        <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded">
                            {selectedVariant.type === 'translation'
                                ? t(
                                      'editor.using.translation',
                                      selectedVariant.language
                                          ? LANGUAGE_NAMES[selectedVariant.language]
                                          : '',
                                  )
                                : t('editor.using', getPromptName(selectedVariant.promptTemplate))}
                        </span>
                    )}

                    <Button variant="secondary" onClick={handleSave} isLoading={isSaving}>
                        <Save size={16} className="mr-1.5" />
                        {hasUnsavedChanges ? `${t('editor.save')}*` : t('editor.saved')}
                    </Button>
                    <Button leftIcon={<Send size={16} />} onClick={handlePublish}>
                        <span className="hidden sm:inline">{t('editor.post_to_x')}</span>
                    </Button>
                </div>
            </header>

            {/* Error message */}
            {error && (
                <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 grid grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-1 lg:grid-cols-[minmax(0,1fr)_24rem] overflow-hidden">
                {/* Source editor */}
                <div className="min-h-0 p-4 lg:p-6 overflow-y-auto border-b border-border-primary lg:border-b-0 lg:border-r">
                    <SourceEditor
                        content={content}
                        onChange={handleContentChange}
                        onBlur={handleBlur}
                        onPolish={openPolishModal}
                        onTranslate={openTranslateModal}
                        isPolishing={isPolishing}
                        isTranslating={isTranslating}
                    />
                </div>

                {/* Variants panel */}
                <div className="min-h-0 p-4 lg:p-6 overflow-y-auto border-t border-border-primary lg:border-t-0">
                    <VariantsPanel
                        variants={variants}
                        onSelectVariant={handleSelectVariant}
                        onDeleteVariant={handleDeleteVariant}
                        onGenerateMore={openPolishModal}
                    />
                </div>
            </div>

            {/* Modals */}
            <PolishModal
                isOpen={isPolishModalOpen}
                onClose={closePolishModal}
                onPolish={handlePolish}
                isLoading={isPolishing}
            />
            <TranslateModal
                isOpen={isTranslateModalOpen}
                onClose={closeTranslateModal}
                onTranslate={handleTranslate}
                isLoading={isTranslating}
                hasSelectedVariant={Boolean(selectedVariant)}
                selectedVariantLabel={selectedVariantLabel}
                defaultSourceMode={selectedVariant ? 'selected' : 'source'}
                defaultTargets={[defaultLanguage]}
                progress={translationProgress}
            />
        </div>
    );
};
