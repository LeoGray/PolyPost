type ProxyFetchRequest = {
    type: 'proxyFetch';
    url: string;
    init?: {
        method?: string;
        headers?: Record<string, string>;
        body?: string;
    };
};

type ProxyFetchResponse = {
    ok: boolean;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
};

const headersToObject = (headers?: HeadersInit): Record<string, string> => {
    if (!headers) {
        return {};
    }

    if (headers instanceof Headers) {
        const result: Record<string, string> = {};
        headers.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    if (Array.isArray(headers)) {
        return headers.reduce<Record<string, string>>((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
    }

    return { ...headers } as Record<string, string>;
};

const readBody = async (
    input: Request | string | URL,
    init?: RequestInit,
): Promise<string | undefined> => {
    if (init?.body) {
        if (typeof init.body === 'string') {
            return init.body;
        }

        if (init.body instanceof URLSearchParams) {
            return init.body.toString();
        }

        if (init.body instanceof ArrayBuffer) {
            return new TextDecoder().decode(init.body);
        }

        if (ArrayBuffer.isView(init.body)) {
            return new TextDecoder().decode(init.body);
        }
    }

    if (input instanceof Request) {
        try {
            return await input.clone().text();
        } catch {
            return undefined;
        }
    }

    return undefined;
};

const sendProxyFetch = (payload: ProxyFetchRequest): Promise<ProxyFetchResponse> => {
    return new Promise((resolve, reject) => {
        if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
            reject(new Error('Proxy fetch is unavailable outside the extension runtime.'));
            return;
        }

        chrome.runtime.sendMessage(payload, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }

            resolve(response as ProxyFetchResponse);
        });
    });
};

export const proxyFetch: typeof fetch = async (input, init) => {
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
        return fetch(input, init);
    }

    const url =
        typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
    const headers = headersToObject(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
    );
    const body = await readBody(input, init);

    const response = await sendProxyFetch({
        type: 'proxyFetch',
        url,
        init: {
            method,
            headers,
            body,
        },
    });

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });
};
