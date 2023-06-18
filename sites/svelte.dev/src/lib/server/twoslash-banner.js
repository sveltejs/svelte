/**
 * @type {(filename: string, source: string) => string}
 */
export const svelte_twoslash_banner = (filename, source) => {
	const injected = [];

	if (/(svelte)/.test(source) || filename.includes('typescript')) {
		injected.push(
			`// @filename: ambient.d.ts`,
			`/// <reference types="svelte" />`,
			`/// <reference types="svelte/action" />`,
			`/// <reference types="svelte/compiler" />`,
			`/// <reference types="svelte/easing" />`,
			`/// <reference types="svelte/motion" />`,
			`/// <reference types="svelte/transition" />`,
			`/// <reference types="svelte/store" />`,
			`/// <reference types="svelte/action" />`
		);
	}

	if (filename.includes('svelte-compiler')) {
		injected.push('// @esModuleInterop');
	}

	if (filename.includes('svelte.md')) {
		injected.push('// @errors: 2304');
	}

	// Actions JSDoc examples are invalid. Too many errors, edge cases
	if (filename.includes('svelte-action')) {
		injected.push('// @noErrors');
	}

	if (filename.includes('typescript')) {
		injected.push('// @errors: 2304');
	}

	// Tutorials
	if (filename.startsWith('tutorial')) {
		injected.push('// @noErrors');
	}

	return injected.join('\n');
};
