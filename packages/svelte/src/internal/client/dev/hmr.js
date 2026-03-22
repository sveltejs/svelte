/** @import { Effect, TemplateNode } from '#client' */
import { FILENAME, HMR } from '../../../constants.js';
import { EFFECT_TRANSPARENT } from '#client/constants';
import { hydrate_node, hydrating } from '../dom/hydration.js';
import { block, branch, destroy_effect } from '../reactivity/effects.js';
import { set, source } from '../reactivity/sources.js';
import { set_should_intro } from '../render.js';
import { get } from '../runtime.js';
import { assign_nodes } from '../dom/template.js';
import { create_comment } from '../dom/operations.js';

/**
 * @template {(anchor: Comment, props: any) => any} Component
 * @param {Component} fn
 */
export function hmr(fn) {
	const current = source(fn);

	/**
	 * @param {TemplateNode} anchor
	 * @param {any} props
	 */
	function wrapper(anchor, props) {
		let component = {};
		let instance = {};

		/** @type {Effect} */
		let effect;

		let ran = false;

		// Surround the wrapped effects with comments and assign the nodes
		// on the wrapping effects so the parent can properly do DOM operations.
		let start = create_comment();
		let end = create_comment();

		// During hydration, inserting the start comment before the anchor could
		// corrupt the DOM tree that the hydration walker is navigating (e.g. when
		// a component is inside a CSS props wrapper gh-issue#17972). We defer the insertion until
		// after the component has hydrated.
		if (!hydrating) {
			anchor.before(start);
		}

		block(() => {
			if (component === (component = get(current))) {
				return;
			}

			if (effect) {
				// @ts-ignore
				for (var k in instance) delete instance[k];
				destroy_effect(effect);
			}

			effect = branch(() => {
				// when the component is invalidated, replace it without transitions
				if (ran) set_should_intro(false);

				// preserve getters/setters
				var result =
					// @ts-expect-error
					new.target ? new component(anchor, props) : component(anchor, props);
				// a component is not guaranteed to return something and we can't invoke getOwnPropertyDescriptors on undefined
				if (result) {
					Object.defineProperties(instance, Object.getOwnPropertyDescriptors(result));
				}

				if (ran) set_should_intro(true);
			});
		}, EFFECT_TRANSPARENT);

		ran = true;

		if (hydrating) {
			// Insert start comment now that hydration is done, so it doesn't
			// corrupt the hydration walk
			anchor.before(start);
			anchor = hydrate_node;
		}

		anchor.before(end);

		assign_nodes(start, end);

		return instance;
	}

	// @ts-expect-error
	wrapper[FILENAME] = fn[FILENAME];

	// @ts-ignore
	wrapper[HMR] = {
		fn,
		current,
		update: (/** @type {any} */ incoming) => {
			// This logic ensures that the first version of the component is the one
			// whose update function and therefore block effect is preserved across updates.
			// If we don't do this dance and instead just use `incoming` as the new component
			// and then update, we'll create an ever-growing stack of block effects.

			// Trigger the original block effect
			set(wrapper[HMR].current, incoming[HMR].fn);

			// Replace the incoming source with the original one
			incoming[HMR].current = wrapper[HMR].current;
		}
	};

	return wrapper;
}
