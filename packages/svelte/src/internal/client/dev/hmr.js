/** @import { Effect, TemplateNode } from '#client' */
import { FILENAME, HMR } from '../../../constants.js';
import { EFFECT_TRANSPARENT } from '#client/constants';
import { hydrate_node, hydrating } from '../dom/hydration.js';
import { block, branch, destroy_effect } from '../reactivity/effects.js';
import { set, source } from '../reactivity/sources.js';
import { set_should_intro } from '../render.js';
import { active_effect, get } from '../runtime.js';

/**
 * Collect all labeled $state signals from an effect tree.
 * Labels are set by $.tag() in dev mode — each $state variable gets
 * a label matching its source-level name (e.g., 'count', 'name').
 * Also recurses into derived deps to find signals inside composables.
 * @param {Effect} effect
 * @returns {Map<string, any>} label → current value
 */
function collect_state(effect) {
	/** @type {Map<string, any>} */
	var state = new Map();
	/** @type {Set<any>} */
	var visited = new Set();

	/** @param {any} dep */
	function collect_from_dep(dep) {
		if (!dep || typeof dep !== 'object' || visited.has(dep)) return;
		visited.add(dep);

		if ('label' in dep && dep.label && 'v' in dep) {
			state.set(/** @type {string} */ (dep.label), dep.v);
		}

		// Recurse into derived/reaction deps to find nested signals
		if ('deps' in dep && Array.isArray(dep.deps)) {
			for (var i = 0; i < dep.deps.length; i++) {
				collect_from_dep(dep.deps[i]);
			}
		}
	}

	/** @param {Effect | null} e */
	function walk(e) {
		if (!e) return;

		if (e.deps) {
			for (var i = 0; i < e.deps.length; i++) {
				collect_from_dep(e.deps[i]);
			}
		}

		var child = e.first;
		while (child) {
			walk(child);
			child = child.next;
		}
	}

	walk(effect);
	return state;
}

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

		block(() => {
			if (component === (component = get(current))) {
				return;
			}

			/** @type {Map<string, any>} */
			var preserved_state = new Map();

			if (effect) {
				// Capture labeled $state signal values before destroying
				// the old component tree. These will be restored via
				// $.tag() during the new component's initialization.
				preserved_state = collect_state(effect);

				// @ts-ignore
				for (var k in instance) delete instance[k];
				destroy_effect(effect);
			}

			// Make preserved state available to $.tag() during the
			// new component's initialization — before template effects
			// render the DOM with default values. Use try/finally to
			// guarantee cleanup even if the component throws.
			if (preserved_state.size > 0) {
				/** @type {any} */ (globalThis).__hmr_preserved_state__ = preserved_state;
			}

			try {
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
			} finally {
				// Always clear preserved state — prevents leakage to
				// subsequent HMR operations if branch() throws
				/** @type {any} */ (globalThis).__hmr_preserved_state__ = undefined;
			}

			// Forward the nodes from the inner effect to the outer active effect which would
			// get them if the HMR wrapper wasn't there. Do this inside the block not outside
			// so that HMR updates to the component will also update the nodes on the active effect.
			/** @type {Effect} */ (active_effect).nodes = effect.nodes;
		}, EFFECT_TRANSPARENT);

		ran = true;

		if (hydrating) {
			anchor = hydrate_node;
		}

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
