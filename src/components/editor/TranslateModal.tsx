import React, { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import type { Language } from '@/types';
import { LANGUAGE_NAMES } from '@/types';
import { Languages } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface TranslateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTranslate: (targetLanguage: Language, sourceLanguage: Language) => void;
    isLoading?: boolean;
}

const languageFlags: Record<Language, string> = {
    en: '🇺🇸',
    zh: '🇨🇳',
    jp: '🇯🇵',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    ko: '🇰🇷',
};

export const TranslateModal: React.FC<TranslateModalProps> = ({
    isOpen,
    onClose,
    onTranslate,
    isLoading = false,
}) => {
    const { t } = useTranslation();
    const [sourceLanguage, setSourceLanguage] = useState<Language>('en');
    const [targetLanguage, setTargetLanguage] = useState<Language>('zh');

    const languages = Object.keys(LANGUAGE_NAMES) as Language[];

    const handleTranslate = () => {
        if (sourceLanguage !== targetLanguage) {
            onTranslate(targetLanguage, sourceLanguage);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('editor.translate.title')} size="sm">
            <div className="space-y-6">
                {/* Source language */}
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        {t('editor.translate.from')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {languages.map((lang) => (
                            <button
                                key={`source-${lang}`}
                                onClick={() => setSourceLanguage(lang)}
                                className={`
                  p-3 rounded-lg border text-center transition-all
                  ${sourceLanguage === lang
                                        ? 'border-accent bg-accent/10'
                                        : 'border-border-primary bg-bg-tertiary hover:border-text-muted'
                                    }
                `}
                            >
                                <span className="text-lg">{languageFlags[lang]}</span>
                                <p className="text-xs text-text-primary mt-1">{LANGUAGE_NAMES[lang]}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Target language */}
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        {t('editor.translate.to')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {languages.map((lang) => (
                            <button
                                key={`target-${lang}`}
                                onClick={() => setTargetLanguage(lang)}
                                disabled={lang === sourceLanguage}
                                className={`
                  p-3 rounded-lg border text-center transition-all
                  ${targetLanguage === lang
                                        ? 'border-accent bg-accent/10'
                                        : lang === sourceLanguage
                                            ? 'border-border-primary bg-bg-tertiary opacity-30 cursor-not-allowed'
                                            : 'border-border-primary bg-bg-tertiary hover:border-text-muted'
                                    }
                `}
                            >
                                <span className="text-lg">{languageFlags[lang]}</span>
                                <p className="text-xs text-text-primary mt-1">{LANGUAGE_NAMES[lang]}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
                    <Button variant="ghost" onClick={onClose}>
                        {t('editor.translate.cancel')}
                    </Button>
                    <Button
                        onClick={handleTranslate}
                        isLoading={isLoading}
                        leftIcon={<Languages size={16} />}
                        disabled={sourceLanguage === targetLanguage}
                    >
                        {t('editor.translate.submit', LANGUAGE_NAMES[targetLanguage])}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
