declare const global: any;

export const globals = (typeof window !== 'undefined'
	? window
	: typeof globalThis !== 'undefined'
	? globalThis
	: global) as unknown as typeof globalThis;
