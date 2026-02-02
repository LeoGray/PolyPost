/**
 * Twitter Web Intent Service
 * Opens Twitter's web intent to compose a tweet with pre-filled content
 */

const TWITTER_INTENT_URL = 'https://twitter.com/intent/tweet';

interface TweetIntentOptions {
    text: string;
    url?: string;
    hashtags?: string[];
    via?: string;
}

/**
 * Opens Twitter Web Intent in a new tab with pre-filled tweet content
 */
export function openTweetIntent(options: TweetIntentOptions): void {
    const params = new URLSearchParams();

    if (options.text) {
        params.set('text', options.text);
    }

    if (options.url) {
        params.set('url', options.url);
    }

    if (options.hashtags && options.hashtags.length > 0) {
        // Remove # prefix if present, Twitter adds it automatically
        const cleanHashtags = options.hashtags.map((tag) =>
            tag.startsWith('#') ? tag.slice(1) : tag
        );
        params.set('hashtags', cleanHashtags.join(','));
    }

    if (options.via) {
        // Remove @ prefix if present
        const cleanVia = options.via.startsWith('@') ? options.via.slice(1) : options.via;
        params.set('via', cleanVia);
    }

    const intentUrl = `${TWITTER_INTENT_URL}?${params.toString()}`;

    // Open in a new tab
    window.open(intentUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Extract hashtags from tweet content
 */
export function extractHashtags(content: string): string[] {
    const hashtagRegex = /#[\w\u4e00-\u9fa5]+/g;
    const matches = content.match(hashtagRegex);
    return matches || [];
}

/**
 * Remove hashtags from content (if you want to pass them separately)
 */
export function removeHashtags(content: string): string {
    return content.replace(/#[\w\u4e00-\u9fa5]+/g, '').trim();
}

export const twitterService = {
    openTweetIntent,
    extractHashtags,
    removeHashtags,
};
