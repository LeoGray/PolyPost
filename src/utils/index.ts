/**
 * Generate a unique ID
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Count characters (Twitter counts differently for some chars)
 */
export function countCharacters(text: string): number {
    // Simplified character count - Twitter has more complex rules
    // For URLs and special characters
    return text.length;
}

/**
 * Get initials from a string (for avatar)
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number,
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), wait);
    };
}

/**
 * Classify content with tags based on content analysis
 */
export function classifyContent(content: string): string[] {
    const tags: string[] = [];

    // Check if it's a thread (has numbering or multiple paragraphs)
    if (/^\d+[\.\)]/m.test(content) || content.split('\n\n').length > 2) {
        tags.push('Thread');
    }

    // Check for emoji richness
    const emojiRegex = /[\p{Emoji}]/gu;
    const emojiCount = (content.match(emojiRegex) || []).length;
    if (emojiCount > 3) {
        tags.push('Emoji');
    }

    // Check for short content
    if (content.length < 100) {
        tags.push('Short');
    }

    // Check for technical content
    const technicalKeywords = ['code', 'api', 'data', 'system', 'algorithm', 'function', 'deploy'];
    if (technicalKeywords.some((kw) => content.toLowerCase().includes(kw))) {
        tags.push('Technical');
    }

    return tags;
}
