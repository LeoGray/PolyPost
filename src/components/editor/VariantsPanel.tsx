import React from 'react';
import { Sparkles, Globe, Plus, Trash2, Copy } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import type { Variant } from '@/types';
import { POLISH_TEMPLATE_NAMES, LANGUAGE_NAMES } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store';

interface VariantsPanelProps {
    variants: Variant[];
    onSelectVariant: (id: string) => void;
    onDeleteVariant: (id: string) => void;
    onGenerateMore: () => void;
    isGenerating?: boolean;
}

export const VariantsPanel: React.FC<VariantsPanelProps> = ({
    variants,
    onSelectVariant,
    onDeleteVariant,
    onGenerateMore,
    isGenerating = false,
}) => {
    const { t } = useTranslation();
    const { prompts } = useSettingsStore();

    const getPromptName = (templateId?: string | null) => {
        if (!templateId) return 'Variant';
        const prompt = prompts.find((item) => item.id === templateId);
        if (prompt?.name) return prompt.name;
        return POLISH_TEMPLATE_NAMES[templateId as keyof typeof POLISH_TEMPLATE_NAMES] || templateId;
    };

    const getVariantLabel = (variant: Variant) => {
        if (variant.type === 'polish' && variant.promptTemplate) {
            return getPromptName(variant.promptTemplate);
        }
        if (variant.type === 'translation' && variant.language) {
            return LANGUAGE_NAMES[variant.language];
        }
        return 'Variant';
    };

    const getVariantIcon = (variant: Variant) => {
        if (variant.type === 'translation') {
            return <Globe size={14} />;
        }
        return <Sparkles size={14} />;
    };

    const getVariantColor = (variant: Variant) => {
        if (variant.type === 'translation') {
            return '#10B981'; // Green
        }
        switch (variant.promptTemplate) {
            case 'professional':
                return '#3B82F6'; // Blue
            case 'viral':
                return '#EF4444'; // Red
            case 'casual':
                return '#F59E0B'; // Orange
            case 'technical':
                return '#8B5CF6'; // Purple
            case 'emoji':
                return '#EC4899'; // Pink
            case 'concise':
                return '#06B6D4'; // Cyan
            default:
                return '#8B949E';
        }
    };

    const handleCopy = async (content: string) => {
        if (!navigator?.clipboard?.writeText) {
            console.warn('Clipboard API is not available.');
            return;
        }

        try {
            await navigator.clipboard.writeText(content);
        } catch (error) {
            console.error('Failed to copy variant content:', error);
        }
    };

    const getVariantFooter = (variant: Variant) => {
        if (variant.type === 'polish') {
            return t('editor.variants.polished');
        }
        if (variant.type === 'translation') {
            return t('editor.variants.translated');
        }
        return variant.description;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-text-primary">{t('editor.variants')}</h2>
                    <span className="text-sm text-text-muted">{variants.length}</span>
                </div>
            </div>

            {/* Variants list */}
            <div className="flex-1 overflow-y-auto overflow-x-visible space-y-3 p-1">
                {variants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                            <Sparkles size={24} className="text-text-muted" />
                        </div>
                        <p className="text-text-muted text-sm">
                            {t('editor.variants.empty')}<br />
                            {t('editor.variants.empty_desc')}
                        </p>
                    </div>
                ) : (
                    variants.map((variant) => (
                        <Card
                            key={variant.id}
                            className={`p-4 ${variant.isSelected ? 'ring-2 ring-accent' : ''
                                }`}
                            onClick={() => onSelectVariant(variant.id)}
                            hoverable
                        >
                            {/* Variant header */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <Badge color={getVariantColor(variant)} className="flex items-center gap-1">
                                    {getVariantIcon(variant)}
                                    {getVariantLabel(variant)}
                                </Badge>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleCopy(variant.content);
                                        }}
                                        className="p-1 rounded hover:bg-bg-tertiary text-text-muted hover:text-text-primary"
                                        aria-label={t('actions.copy')}
                                        title={t('actions.copy')}
                                    >
                                        <Copy size={14} />
                                    </button>
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onDeleteVariant(variant.id);
                                        }}
                                        className="p-1 rounded hover:bg-bg-tertiary text-text-muted hover:text-red-400"
                                        aria-label={t('actions.delete')}
                                        title={t('actions.delete')}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Content preview */}
                            <p className="text-sm text-text-primary leading-relaxed mb-3 whitespace-pre-wrap break-words">
                                {variant.content}
                            </p>

                            {/* Footer */}
                            <div className="text-xs text-text-muted">
                                {getVariantFooter(variant)}
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Generate more button */}
            <div className="mt-4 pt-4 border-t border-border-primary">
                <Button
                    variant="ghost"
                    className="w-full justify-center"
                    leftIcon={<Plus size={18} />}
                    onClick={onGenerateMore}
                    isLoading={isGenerating}
                >
                    {isGenerating ? t('editor.variants.generate_more.loading') : t('editor.variants.generate_more')}
                </Button>
            </div>
        </div>
    );
};
