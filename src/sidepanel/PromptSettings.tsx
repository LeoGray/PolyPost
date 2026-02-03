import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, AlertCircle, MoreHorizontal, Check } from 'lucide-react';
import { useSettingsStore, useUIStore } from '@/store';
import { useTranslation, type DictionaryKey } from '@/hooks/useTranslation';
import { Card, Button, Badge } from '@/components/ui';
import type { PolishPrompt } from '@/types';

// Internal component for Grid View Card
const PromptCard: React.FC<{
    prompt: PolishPrompt;
    isDefault: boolean;
    onSetDefault: (id: string) => void;
    onEdit: (prompt: PolishPrompt) => void;
    onDelete: (id: string) => void;
    canDelete: boolean;
    t: (key: DictionaryKey, ...args: (string | number)[]) => string;
}> = ({ prompt, isDefault, onSetDefault, onEdit, onDelete, canDelete, t }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <Card
            hoverable
            onClick={() => onEdit(prompt)}
            className={`p-4 flex flex-col gap-3 relative h-full transition-all duration-200 group ${isDefault ? 'border-accent/40' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary text-sm">{prompt.name}</span>
                    {isDefault && (
                        <Badge
                            variant="default"
                            className="!bg-accent !text-white border-transparent py-0 h-5"
                        >
                            {t('settings.prompts.default_label')}
                        </Badge>
                    )}
                </div>
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-1 rounded hover:bg-bg-tertiary text-text-muted"
                    >
                        <MoreHorizontal size={16} />
                    </button>
                    {showMenu && (
                        <div
                            className="absolute right-0 top-full mt-1 w-44 bg-bg-secondary border border-border-primary rounded-lg shadow-lg z-10 py-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSetDefault(prompt.id);
                                    setShowMenu(false);
                                }}
                                disabled={isDefault}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-tertiary ${isDefault ? 'opacity-50 cursor-not-allowed text-text-muted' : 'text-text-primary'}`}
                            >
                                <Check size={14} />
                                {t('settings.prompts.set_default') || 'Set as Default'}
                            </button>
                            <button
                                onClick={() => {
                                    onEdit(prompt);
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-tertiary"
                            >
                                <Pencil size={14} />
                                {t('settings.prompts.edit')}
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(prompt.id);
                                    setShowMenu(false);
                                }}
                                disabled={!canDelete}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-tertiary ${!canDelete ? 'opacity-50 cursor-not-allowed text-text-muted' : 'text-red-400'}`}
                            >
                                <Trash2 size={14} />
                                {t('settings.prompts.delete')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-text-secondary text-sm leading-relaxed font-mono flex-1 line-clamp-6 whitespace-pre-wrap">
                {prompt.content || prompt.template}
            </p>
        </Card>
    );
};

// Internal component for List View Item
const PromptListItem: React.FC<{
    prompt: PolishPrompt;
    isDefault: boolean;
    onSetDefault: (id: string) => void;
    onEdit: (prompt: PolishPrompt) => void;
    onDelete: (id: string) => void;
    canDelete: boolean;
    t: (key: DictionaryKey, ...args: (string | number)[]) => string;
}> = ({ prompt, isDefault, onSetDefault, onEdit, onDelete, canDelete, t }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div
            onClick={() => onEdit(prompt)}
            className="flex items-center gap-4 px-4 py-3 bg-bg-secondary hover:bg-bg-tertiary border border-border-primary rounded-lg transition-colors group cursor-pointer"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary text-sm">{prompt.name}</span>
                    {isDefault && (
                        <Badge
                            variant="default"
                            className="!bg-accent !text-white border-transparent py-0 h-5"
                        >
                            {t('settings.prompts.default_label')}
                        </Badge>
                    )}
                </div>
                <div className="text-xs text-text-secondary font-mono mt-1 opacity-70 truncate">
                    {prompt.content || prompt.template}
                </div>
            </div>

            <div className="relative">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="p-1 rounded hover:bg-bg-primary text-text-muted"
                >
                    <MoreHorizontal size={16} />
                </button>
                {showMenu && (
                    <div
                        className="absolute right-0 top-full mt-1 w-44 bg-bg-secondary border border-border-primary rounded-lg shadow-lg z-10 py-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSetDefault(prompt.id);
                                setShowMenu(false);
                            }}
                            disabled={isDefault}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-tertiary ${isDefault ? 'opacity-50 cursor-not-allowed text-text-muted' : 'text-text-primary'}`}
                        >
                            <Check size={14} />
                            {t('settings.prompts.set_default') || 'Set as Default'}
                        </button>
                        <button
                            onClick={() => {
                                onEdit(prompt);
                                setShowMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-tertiary"
                        >
                            <Pencil size={14} />
                            {t('settings.prompts.edit')}
                        </button>
                        <button
                            onClick={() => {
                                onDelete(prompt.id);
                                setShowMenu(false);
                            }}
                            disabled={!canDelete}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-tertiary ${!canDelete ? 'opacity-50 cursor-not-allowed text-text-muted' : 'text-red-400'}`}
                        >
                            <Trash2 size={14} />
                            {t('settings.prompts.delete')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const PromptSettings: React.FC = () => {
    const {
        prompts,
        addPrompt,
        updatePrompt,
        deletePrompt,
        defaultPolishTemplate,
        setDefaultPolishTemplate,
    } = useSettingsStore();
    const { viewMode } = useUIStore();
    const { t } = useTranslation();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<Omit<PolishPrompt, 'id'>>({
        template: '',
        name: '',
        description: '',
        content: '',
    });

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ name: '', description: '', template: '', content: '' });
    };

    const handleEdit = (prompt: PolishPrompt) => {
        setEditingId(prompt.id);
        setFormData({
            name: prompt.name,
            description: '',
            template: prompt.template,
            content: prompt.content,
        });
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this prompt?')) {
            try {
                await deletePrompt(id);
            } catch (err) {
                // Error handled by store usually, or alert
                console.error(err);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.content) return;

        try {
            if (isAdding) {
                const newId = `custom_${Date.now()}`;
                await addPrompt({
                    id: newId,
                    template: formData.template || newId,
                    name: formData.name,
                    description: formData.description || '',
                    content: formData.content,
                } as PolishPrompt);
            } else if (editingId) {
                await updatePrompt({
                    id: editingId,
                    name: formData.name,
                    description: formData.description || '',
                    template: formData.template,
                    content: formData.content,
                } as PolishPrompt);
            }
            resetForm();
        } catch (error) {
            console.error('Failed to save prompt:', error);
        }
    };

    const isFormOpen = isAdding || editingId !== null;

    return (
        <div className="h-full flex flex-col">
            {/* Header: Title + Add Button */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-text-primary">
                        {isFormOpen
                            ? isAdding
                                ? t('settings.prompts.add')
                                : t('settings.prompts.edit')
                            : t('settings.prompts.title')}
                    </h2>
                    <p className="text-sm text-text-muted mt-1">
                        {!isFormOpen && t('settings.prompts.subtitle')}
                    </p>
                </div>
                {!isFormOpen && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm"
                    >
                        <Plus size={16} />
                        <span>{t('settings.prompts.add')}</span>
                    </button>
                )}
                {isFormOpen && (
                    <button onClick={resetForm} className="text-text-muted hover:text-text-primary">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Edit/Add Form */}
            {isFormOpen ? (
                <div className="bg-bg-secondary p-4 rounded-lg border border-border-primary animate-in fade-in slide-in-from-bottom-2 flex-1 flex flex-col min-h-0">
                    <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
                        <div>
                            <label className="block text-xs font-medium text-text-muted uppercase mb-1">
                                {t('settings.prompts.form.name')}
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-text-muted/50"
                                placeholder={t('settings.prompts.form.name')}
                                required
                            />
                        </div>

                        <div className="flex-1 flex flex-col min-h-0">
                            <label className="block text-xs font-medium text-text-muted uppercase mb-1">
                                {t('settings.prompts.form.template')}
                            </label>
                            <div className="relative flex-1 flex flex-col min-h-0">
                                <textarea
                                    value={formData.content}
                                    onChange={(e) =>
                                        setFormData({ ...formData, content: e.target.value })
                                    }
                                    className="w-full flex-1 bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none font-mono text-sm placeholder:text-text-muted/50 min-h-[200px]"
                                    placeholder={t('settings.prompts.form.template.placeholder')}
                                    required
                                />
                                <div className="absolute top-2 right-2 group">
                                    <AlertCircle
                                        size={14}
                                        className="text-text-muted cursor-help"
                                    />
                                    <div className="absolute right-0 w-64 p-2 bg-popover rounded shadow-lg border border-border-primary text-xs text-text-secondary invisible group-hover:visible z-10">
                                        Use <code>{'{content}'}</code> as a placeholder for the
                                        user's input text.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={resetForm}>
                                {t('settings.prompts.form.cancel')}
                            </Button>
                            <Button type="submit" size="sm" leftIcon={<Save size={16} />}>
                                {t('settings.prompts.form.save')}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                /* Prompts List/Grid */
                <div
                    className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6'
                            : 'flex flex-col gap-2 pb-6'
                    }
                >
                    {prompts.map((prompt) =>
                        viewMode === 'grid' ? (
                            <PromptCard
                                key={prompt.id}
                                prompt={prompt}
                                isDefault={prompt.id === defaultPolishTemplate}
                                onSetDefault={setDefaultPolishTemplate}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                canDelete={prompts.length > 1}
                                t={t}
                            />
                        ) : (
                            <PromptListItem
                                key={prompt.id}
                                prompt={prompt}
                                isDefault={prompt.id === defaultPolishTemplate}
                                onSetDefault={setDefaultPolishTemplate}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                canDelete={prompts.length > 1}
                                t={t}
                            />
                        ),
                    )}

                    {/* Add Button as Card in Grid View */}
                    {viewMode === 'grid' && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="min-h-[180px] rounded-xl border-2 border-dashed border-border-primary flex flex-col items-center justify-center gap-2 text-text-muted hover:text-text-primary hover:border-accent transition-colors duration-200"
                        >
                            <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center">
                                <Plus size={24} />
                            </div>
                            <span className="text-sm">{t('settings.prompts.add')}</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
