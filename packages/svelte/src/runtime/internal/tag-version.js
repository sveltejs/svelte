import { VERSION } from '../../shared/version.js';

if (typeof window !== 'undefined')
	// @ts-ignore
	(window.__svelte ||= { v: new Set() }).v.add(VERSION.replace(/(\d+).*/, '$1'));
