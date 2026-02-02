export const OPTIONAL_HOST_ORIGINS = [
    '<all_urls>',
    // Keep in sync with manifest.json optional_host_permissions.
];

export type HostPermissionFailureReason = 'invalid_url' | 'not_allowed' | 'denied';

const toOriginPattern = (baseUrl: string): string | null => {
    if (!baseUrl) {
        return null;
    }

    try {
        const url = new URL(baseUrl.trim());
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
            return null;
        }
        return `${url.protocol}//${url.host}/*`;
    } catch {
        return null;
    }
};

export const ensureHostPermission = async (baseUrl: string): Promise<{
    granted: boolean;
    origin?: string;
    reason?: HostPermissionFailureReason;
}> => {
    const origin = toOriginPattern(baseUrl);
    if (!origin) {
        return { granted: false, reason: 'invalid_url' };
    }

    const allowAll = OPTIONAL_HOST_ORIGINS.includes('<all_urls>');

    if (!allowAll && !OPTIONAL_HOST_ORIGINS.includes(origin)) {
        return { granted: false, origin, reason: 'not_allowed' };
    }

    if (typeof chrome === 'undefined' || !chrome.permissions) {
        return { granted: true, origin };
    }

    const alreadyGranted = await chrome.permissions.contains({ origins: [origin] });
    if (alreadyGranted) {
        return { granted: true, origin };
    }

    try {
        const granted = await chrome.permissions.request({ origins: [origin] });
        return granted ? { granted: true, origin } : { granted: false, origin, reason: 'denied' };
    } catch {
        return { granted: false, origin, reason: 'denied' };
    }
};
