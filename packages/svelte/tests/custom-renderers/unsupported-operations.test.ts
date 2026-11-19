import { afterEach, assert, describe, it } from 'vitest';
import { pop_renderer, push_renderer } from '../../src/internal/client/custom-renderer/state.js';
import {
	clone_node,
	dispatch_event,
	import_node,
	set_inner_html,
	set_text_content
} from '../../src/internal/client/dom/operations.js';
import renderer from './renderer.js';

// These operations only work with the DOM and are never expected to run while a custom
// renderer is active. If they do (i.e. because of a bug in Svelte), they should fail with a
// documented error rather than a generic one.
describe('DOM-only operations with a custom renderer', () => {
	let previous: ReturnType<typeof push_renderer> = null;

	afterEach(() => {
		pop_renderer(previous);
	});

	const operations: Array<[string, () => unknown]> = [
		['innerHTML', () => set_inner_html({} as any, '')],
		['cloneNode', () => clone_node({} as any, true)],
		['importNode', () => import_node({} as any, true)],
		['dispatchEvent', () => dispatch_event({} as any, {} as any)],
		['textContent', () => set_text_content({} as any, '')]
	];

	for (const [name, operation] of operations) {
		it(`throws custom_renderer_unsupported_operation for ${name}`, () => {
			previous = push_renderer(renderer);

			assert.throws(
				operation,
				`custom_renderer_unsupported_operation\n\`${name}\` is not supported when rendering with a custom renderer`
			);
		});
	}
});
