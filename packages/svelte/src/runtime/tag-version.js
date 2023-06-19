import { VERSION } from '../shared/version.js';

if (typeof window !== 'undefined')
	// @ts-ignore
	(window.__svelte_versions || (window.__svelte_versions = [])).push(VERSION);
