import { VERSION } from '../shared/version';

// @ts-ignore
if (typeof window !== undefined) (window.__svelte || (window.__svelte = {})).version = VERSION;
