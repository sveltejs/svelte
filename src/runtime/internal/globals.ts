declare const global: any;

export const globals = (typeof globalThis !== 'undefined'
	? globalThis
	: typeof window !== 'undefined'
	? window
	: global) as unknown as typeof globalThis;
