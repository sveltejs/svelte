export const globals =
	typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : global;
