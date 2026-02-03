import React, { useState, useRef } from 'react';
import { Sparkles, Languages } from 'lucide-react';
import { Button } from '@/components/ui';
import { countCharacters } from '@/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface SourceEditorProps {
    content: string;
    onChange: (content: string) => void;
    onBlur?: () => void;
    onPolish: () => void;
    onTranslate: () => void;
    isPolishing?: boolean;
    isTranslating?: boolean;
    campaignName?: string;
}

export const SourceEditor: React.FC<SourceEditorProps> = ({
    content,
    onChange,
    onBlur,
    onPolish,
    onTranslate,
    isPolishing = false,
    isTranslating = false,
    campaignName,
}) => {
    const { t } = useTranslation();
    const charCount = countCharacters(content);
    const maxChars = 280;
    const isOverLimit = charCount > maxChars;

    // Track IME composition state
    const isComposingRef = useRef(false);
    const [isComposing, setIsComposing] = useState(false);
    const [localValue, setLocalValue] = useState(content);

    // Sync local value with props when content changes externally
    React.useEffect(() => {
        if (!isComposingRef.current) {
            setLocalValue(content);
        }
    }, [content]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        if (isComposingRef.current) {
            setLocalValue(newValue);
            return;
        }
        onChange(newValue);
    };

    const handleCompositionStart = () => {
        isComposingRef.current = true;
        setIsComposing(true);
        setLocalValue(content);
    };

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
        isComposingRef.current = false;
        setIsComposing(false);
        setLocalValue((e.target as HTMLTextAreaElement).value);
        // Propagate the final composed value
        onChange((e.target as HTMLTextAreaElement).value);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                        {t('editor.source.label')}
                    </h2>
                    <p className="text-sm text-text-muted">{t('editor.source.desc')}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Sparkles size={16} />}
                        onClick={onPolish}
                        isLoading={isPolishing}
                    >
                        {t('editor.ai_polish')}
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Languages size={16} />}
                        onClick={onTranslate}
                        isLoading={isTranslating}
                    >
                        {t('editor.translate')}
                    </Button>
                </div>
            </div>

            {/* Content area */}
            <div className="flex-1 flex flex-col">
                <textarea
                    value={isComposing ? localValue : content}
                    onChange={handleChange}
                    onBlur={onBlur}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                    placeholder={t('editor.source.placeholder_text')}
                    className="flex-1 min-h-[200px] w-full px-4 py-3 bg-bg-secondary border border-border-primary rounded-xl
            text-text-primary placeholder-text-muted text-sm
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            resize-none"
                />

                {/* Footer */}
                <div className="flex items-center justify-between mt-4">
                    {/* Media buttons */}
                    {/* Media buttons - REMOVED as Twitter Web Intent doesn't support media */}
                    <div className="flex items-center gap-2">{/* Buttons removed */}</div>

                    {/* Campaign and char count */}
                    <div className="flex items-center gap-4">
                        {campaignName && (
                            <span className="text-sm text-accent">{campaignName}</span>
                        )}
                        <div className="flex items-center gap-2">
                            <div
                                className={`h-1.5 w-24 rounded-full overflow-hidden ${
                                    isOverLimit ? 'bg-red-500/20' : 'bg-bg-tertiary'
                                }`}
                            >
                                <div
                                    className={`h-full transition-all ${
                                        isOverLimit ? 'bg-red-500' : 'bg-accent'
                                    }`}
                                    style={{
                                        width: `${Math.min((charCount / maxChars) * 100, 100)}%`,
                                    }}
                                />
                            </div>
                            <span
                                className={`text-sm ${
                                    isOverLimit ? 'text-red-500' : 'text-text-muted'
                                }`}
                            >
                                {t('editor.char_count', charCount, maxChars)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
