// Stresses operations.create_element on plain HTML tags — the hot path for
// `<svelte:element this={tag}>`, run_scripts, the css <style> injector, and
// the {@html} <template>/<svg>/<math> wrapper.

import { bench, describe } from 'vitest';
// Internal symbol, not exported via the package's `exports` map — pull it
// straight from source.
import { create_element } from '../../../packages/svelte/src/internal/client/dom/operations.js';

const TAGS = ['div', 'span', 'p', 'li', 'a', 'button', 'section', 'article', 'header', 'footer'];

describe('create_element', () => {
	bench('create_element(htmlTag) ×10', () => {
		// A tiny inner loop lets tinybench amortize call-site overhead and gives
		// a per-iteration cost firmly in the µs range, where its sampling logic
		// converges cleanly.
		for (let i = 0; i < 10; i++) {
			create_element(TAGS[i]);
		}
	});
});
