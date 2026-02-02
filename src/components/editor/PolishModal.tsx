import React, { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import type { PolishTemplate } from '@/types';
import { useSettingsStore } from '@/store';
import { Sparkles, Briefcase, Flame, Coffee, Cpu, Smile, Zap, PenTool } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface PolishModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPolish: (templateId: string) => void;
    isLoading?: boolean;
}

const templateIcons: Record<string, React.ReactNode> = {
    professional: <Briefcase size={20} />,
    viral: <Flame size={20} />,
    casual: <Coffee size={20} />,
    technical: <Cpu size={20} />,
    emoji: <Smile size={20} />,
    concise: <Zap size={20} />,
};

const templateColors: Record<string, string> = {
    professional: '#3B82F6',
    viral: '#EF4444',
    casual: '#F59E0B',
    technical: '#8B5CF6',
    emoji: '#EC4899',
    concise: '#06B6D4',
};

// Fallback color/icon for custom prompts
const DEFAULT_ICON = <PenTool size={20} />;
const DEFAULT_COLOR = '#64748B';

export const PolishModal: React.FC<PolishModalProps> = ({
    isOpen,
    onClose,
    onPolish,
    isLoading = false,
}) => {
    const { t } = useTranslation();
    const { prompts, defaultPolishTemplate } = useSettingsStore();
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(defaultPolishTemplate || 'professional');

    const handlePolish = () => {
        onPolish(selectedTemplateId);
    };

    const getIcon = (id: string, templateKey: string) => {
        return templateIcons[templateKey] || templateIcons[id] || DEFAULT_ICON;
    };

    const getColor = (id: string, templateKey: string) => {
        return templateColors[templateKey] || templateColors[id] || DEFAULT_COLOR;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('editor.polish.title')} size="md">
            <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                    {t('editor.polish.desc')}
                </p>

                {/* Template grid */}
                <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                    {prompts.map((prompt) => (
                        <button
                            key={prompt.id}
                            onClick={() => setSelectedTemplateId(prompt.id)}
                            className={`
                                p-4 rounded-xl border text-left transition-all
                                ${selectedTemplateId === prompt.id
                                    ? 'border-accent bg-accent/10'
                                    : 'border-border-primary bg-bg-tertiary hover:border-text-muted'
                                }
                            `}
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                                style={{
                                    backgroundColor: `${getColor(prompt.id, prompt.template)}20`,
                                    color: getColor(prompt.id, prompt.template)
                                }}
                            >
                                {getIcon(prompt.id, prompt.template)}
                            </div>
                            <h3 className="font-medium text-text-primary text-sm truncate">
                                {prompt.name}
                            </h3>
                            <p className="text-xs text-text-muted mt-1 line-clamp-2">
                                {prompt.description}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
                    <Button variant="ghost" onClick={onClose}>
                        {t('editor.polish.cancel')}
                    </Button>
                    <Button
                        onClick={handlePolish}
                        isLoading={isLoading}
                        leftIcon={<Sparkles size={16} />}
                        disabled={!selectedTemplateId}
                    >
                        {t('editor.polish.submit')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
