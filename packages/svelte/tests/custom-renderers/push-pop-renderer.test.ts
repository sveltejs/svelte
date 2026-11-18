import { afterEach, assert, describe, it } from 'vitest';
import {
	current_renderer,
	pop_renderer,
	push_renderer
} from '../../src/internal/client/custom-renderer/state.js';
import { hydrating, set_hydrating } from '../../src/internal/client/dom/hydration.js';
import { create_test_renderer } from './renderer.js';

const a = create_test_renderer({ cross: true });
const b = create_test_renderer({ cross: true });

describe('push_renderer/pop_renderer', () => {
	afterEach(() => {
		set_hydrating(false);
	});

	it('restores the previous renderer, including when nested', () => {
		const outer = push_renderer(a);
		assert.equal(outer, null);
		assert.equal(current_renderer, a);

		const inner = push_renderer(b);
		assert.equal(inner, a);
		assert.equal(current_renderer, b);

		const dom = push_renderer(null);
		assert.equal(dom, b);
		assert.equal(current_renderer, null);

		pop_renderer(dom);
		assert.equal(current_renderer, b);
		pop_renderer(inner);
		assert.equal(current_renderer, a);
		pop_renderer(outer);
		assert.equal(current_renderer, null);
	});

	it('suspends hydration while a custom renderer is active', () => {
		set_hydrating(true);

		// pushing the DOM doesn't affect hydration
		const dom = push_renderer(null);
		assert.isTrue(hydrating);

		// the first custom renderer suspends it...
		const first = push_renderer(a);
		assert.isFalse(hydrating);

		// ...and it stays suspended for nested renderers, including the DOM
		const nested = push_renderer(b);
		const nested_dom = push_renderer(null);
		assert.isFalse(hydrating);
		pop_renderer(nested_dom);
		pop_renderer(nested);
		assert.isFalse(hydrating);

		// it's only resumed by the pop that matches the push that suspended it
		pop_renderer(first);
		assert.isTrue(hydrating);

		pop_renderer(dom);
		assert.isTrue(hydrating);
	});

	it("doesn't resume hydration that wasn't suspended by a push", () => {
		const previous = push_renderer(a);
		assert.isFalse(hydrating);
		pop_renderer(previous);
		assert.isFalse(hydrating);
	});
});
