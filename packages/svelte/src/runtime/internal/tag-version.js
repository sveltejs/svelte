import { VERSION } from '../../shared/version.js';

if (typeof window !== 'undefined')
	// @ts-ignore
	(window.__svelte ||= { versions: new Set() }).versions.add(VERSION);
