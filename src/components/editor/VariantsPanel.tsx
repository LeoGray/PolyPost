import React from 'react';
import { Sparkles, Globe, Plus, ArrowRight, Trash2 } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import type { Variant } from '@/types';
import { POLISH_TEMPLATE_NAMES, LANGUAGE_NAMES } from '@/types';
import { truncateText } from '@/utils';
import { useTranslation } from '@/hooks/useTranslation';

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

    const getVariantLabel = (variant: Variant) => {
        if (variant.type === 'polish' && variant.promptTemplate) {
            return POLISH_TEMPLATE_NAMES[variant.promptTemplate];
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

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-text-primary">{t('editor.variants')}</h2>
                    <span className="text-sm text-text-muted">{variants.length}</span>
                </div>
                {variants.length > 0 && (
                    <button className="text-sm text-accent hover:underline">{t('editor.variants.view_all')}</button>
                )}
            </div>

            {/* Variants list */}
            <div className="flex-1 overflow-y-auto space-y-3">
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
                        >
                            {/* Variant header */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <Badge color={getVariantColor(variant)} className="flex items-center gap-1">
                                    {getVariantIcon(variant)}
                                    {getVariantLabel(variant)}
                                </Badge>
                                <button
                                    onClick={() => onDeleteVariant(variant.id)}
                                    className="p-1 rounded hover:bg-bg-tertiary text-text-muted hover:text-red-400"
                                    aria-label={t('actions.delete')}
                                    title={t('actions.delete')}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Content preview */}
                            <p className="text-sm text-text-primary leading-relaxed mb-3">
                                {truncateText(variant.content, 150)}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-muted">
                                    {variant.description}
                                </span>
                                <button
                                    onClick={() => onSelectVariant(variant.id)}
                                    className="flex items-center gap-1 text-xs text-accent hover:underline whitespace-nowrap"
                                >
                                    <span className="relative top-px">
                                        {t('editor.variants.use_this')}
                                    </span>
                                    <ArrowRight size={14} />
                                </button>
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
