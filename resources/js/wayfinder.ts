export type RouteQueryOptions = Record<string, string | number | boolean | null | undefined>;

export interface RouteDefinition<Method extends string = string> {
    methods: readonly Method[];
    url: string;
}

export interface RouteFormDefinition extends RouteDefinition<'post' | 'put' | 'patch' | 'delete'> {
    csrf: string;
}

export function queryParams(options?: RouteQueryOptions): string {
    if (!options || Object.keys(options).length === 0) {
        return '';
    }

    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(options)) {
        if (value !== null && value !== undefined) {
            params.append(key, String(value));
        }
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
}

export function applyUrlDefaults<T extends Record<string, any>>(
    args: T,
    defaults: Partial<T>
): T {
    return { ...defaults, ...args };
}
