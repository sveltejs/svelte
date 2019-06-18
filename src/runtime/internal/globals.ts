declare const global: any;

export const globals = (typeof window !== 'undefined' ? window : global) as unknown as typeof globalThis;
