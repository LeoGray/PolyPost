import { getWebExt } from '@/services/webext';

export const REQUIRED_HOST_ORIGINS = [
    'https://api.openai.com/*',
    'https://x.com/*',
    'https://*.x.com/*',
    'https://twitter.com/*',
    'https://*.twitter.com/*',
    // Keep in sync with manifest.json host_permissions.
];

export const OPTIONAL_HOST_ORIGINS = [
    'https://*/*',
    'http://*/*',
    // Keep in sync with manifest.json optional_host_permissions.
];

export type HostPermissionFailureReason = 'invalid_url' | 'not_allowed' | 'denied';

const escapeRegex = (value: string) => value.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');

const matchesOriginPattern = (origin: string, pattern: string) => {
    if (pattern === origin) {
        return true;
    }

    const regex = new RegExp(`^${pattern.split('*').map(escapeRegex).join('.*')}$`);
    return regex.test(origin);
};

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

export const ensureHostPermission = async (
    baseUrl: string,
): Promise<{
    granted: boolean;
    origin?: string;
    reason?: HostPermissionFailureReason;
}> => {
    const origin = toOriginPattern(baseUrl);
    if (!origin) {
        return { granted: false, reason: 'invalid_url' };
    }

    const isRequiredByManifest = REQUIRED_HOST_ORIGINS.some((pattern) =>
        matchesOriginPattern(origin, pattern),
    );
    if (isRequiredByManifest) {
        // Required host permissions are granted at install time and do not need runtime prompts.
        return { granted: true, origin };
    }

    const allowAll = OPTIONAL_HOST_ORIGINS.includes('<all_urls>');
    const isAllowed = allowAll
        ? true
        : OPTIONAL_HOST_ORIGINS.some((pattern) => matchesOriginPattern(origin, pattern));

    if (!isAllowed) {
        return { granted: false, origin, reason: 'not_allowed' };
    }

    const webext = getWebExt();
    const permissionsApi = webext?.permissions as
        | {
              contains?: (options: { origins: string[] }) => Promise<boolean>;
              request?: (options: { origins: string[] }) => Promise<boolean>;
          }
        | undefined;

    if (!permissionsApi?.contains || !permissionsApi?.request) {
        return { granted: true, origin };
    }

    const alreadyGranted = await permissionsApi.contains({ origins: [origin] });
    if (alreadyGranted) {
        return { granted: true, origin };
    }

    try {
        const granted = await permissionsApi.request({ origins: [origin] });
        return granted ? { granted: true, origin } : { granted: false, origin, reason: 'denied' };
    } catch {
        return { granted: false, origin, reason: 'denied' };
    }
};
