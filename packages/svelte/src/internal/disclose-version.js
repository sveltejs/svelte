import { PUBLIC_VERSION } from '../version.js';

if (typeof window !== 'undefined') {
	// @ts-expect-error
	((globalThis.__svelte ??= {}).v ??= new Set()).add(PUBLIC_VERSION);
}
