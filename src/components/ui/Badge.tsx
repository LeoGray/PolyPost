import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'draft' | 'scheduled' | 'posted' | 'language' | 'tag';
    color?: string;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    color,
    className = '',
}) => {
    const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium';

    const variantStyles = {
        default: 'bg-bg-tertiary text-text-secondary',
        draft: 'bg-status-draft/20 text-status-draft',
        scheduled: 'bg-status-scheduled/20 text-status-scheduled',
        posted: 'bg-status-posted/20 text-status-posted',
        language: 'bg-accent/20 text-accent',
        tag: 'bg-bg-tertiary text-text-secondary',
    };

    const style = color ? { backgroundColor: `${color}20`, color } : undefined;

    return (
        <span
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={style}
        >
            {children}
        </span>
    );
};
