import { modules } from '$lib/generated/type-info';
import { renderContentMarkdown, slugify } from '@sveltejs/site-kit/markdown';

/**
 * @param {string} filename
 * @param {string} body
 * @returns
 */
export const render_content = (filename, body) =>
	renderContentMarkdown(filename, body, {
		cacheCodeSnippets: true,
		modules,

		resolveTypeLinks: (module_name, type_name) => {
			return {
				page: `/docs/${slugify(module_name)}`,
				slug: `types-${slugify(type_name)}`
			};
		},

		twoslashBanner: (filename, source) => {
			const injected = [];

			if (/(svelte)/.test(source) || filename.includes('typescript')) {
				injected.push(`// @filename: ambient.d.ts`, `/// <reference types="svelte" />`);
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
		}
	});
