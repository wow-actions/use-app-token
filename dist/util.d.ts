export declare function getAppToken(): Promise<string>;
export declare function saveTokenToSecret(secretName: string, token: string): Promise<void | null>;
export declare function removeTokenFromSecret(secretName: string): Promise<void | null>;
