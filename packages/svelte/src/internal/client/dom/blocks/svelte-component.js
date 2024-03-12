import { DYNAMIC_COMPONENT_BLOCK } from '../../constants.js';
import { hydrate_block_anchor } from '../hydration.js';
import { destroy_effect, render_effect } from '../../reactivity/effects.js';
import { remove } from '../reconciler.js';
import { current_block, execute_effect } from '../../runtime.js';
import { trigger_transitions } from '../elements/transitions.js';

/**
 * @template P
 * @param {Comment} anchor_node
 * @param {() => (props: P) => void} component_fn
 * @param {(component: (props: P) => void) => void} render_fn
 * @returns {void}
 */
export function component(anchor_node, component_fn, render_fn) {
	/** @type {import('#client').DynamicComponentBlock} */
	const block = {
		// dom
		d: null,
		// effect
		e: null,
		// parent
		p: /** @type {import('#client').Block} */ (current_block),
		// transition
		r: null,
		// type
		t: DYNAMIC_COMPONENT_BLOCK
	};

	/** @type {null | import('#client').Render} */
	let current_render = null;
	hydrate_block_anchor(anchor_node);

	/** @type {null | ((props: P) => void)} */
	let component = null;

	block.r =
		/**
		 * @param {import('#client').Transition} transition
		 * @returns {void}
		 */
		(transition) => {
			const render = /** @type {import('#client').Render} */ (current_render);
			const transitions = render.s;
			transitions.add(transition);
			transition.f(() => {
				transitions.delete(transition);
				if (transitions.size === 0) {
					// If the current render has changed since, then we can remove the old render
					// effect as it's stale.
					if (current_render !== render && render.e !== null) {
						if (render.d !== null) {
							remove(render.d);
							render.d = null;
						}
						destroy_effect(render.e);
						render.e = null;
					}
				}
			});
		};

	const create_render_effect = () => {
		/** @type {import('#client').Render} */
		const render = {
			d: null,
			e: null,
			s: new Set(),
			p: current_render
		};

		// Managed effect
		render.e = render_effect(
			() => {
				const current = block.d;
				if (current !== null) {
					remove(current);
					block.d = null;
				}
				if (component) {
					render_fn(component);
				}
				render.d = block.d;
				block.d = null;
			},
			block,
			true
		);

		current_render = render;
	};

	const render = () => {
		const render = current_render;

		if (render === null) {
			create_render_effect();
			return;
		}

		const transitions = render.s;

		if (transitions.size === 0) {
			if (render.d !== null) {
				remove(render.d);
				render.d = null;
			}
			if (render.e) {
				execute_effect(render.e);
			} else {
				create_render_effect();
			}
		} else {
			create_render_effect();
			trigger_transitions(transitions, 'out');
		}
	};

	const component_effect = render_effect(
		() => {
			const next_component = component_fn();
			if (component !== next_component) {
				component = next_component;
				render();
			}
		},
		block,
		false
	);

	component_effect.ondestroy = () => {
		let render = current_render;
		while (render !== null) {
			const dom = render.d;
			if (dom !== null) {
				remove(dom);
			}
			const effect = render.e;
			if (effect !== null) {
				destroy_effect(effect);
			}
			render = render.p;
		}
	};

	block.e = component_effect;
}
