import { UNINITIALIZED, KEY_BLOCK } from '../../constants.js';
import { hydrate_block_anchor } from '../../hydration.js';
import { remove } from '../../reconciler.js';
import { current_block, destroy_signal, execute_effect, push_destroy_fn } from '../../runtime.js';
import { render_effect } from '../../reactivity/effects.js';
import { trigger_transitions } from '../../transitions.js';
import { safe_not_equal } from '../../reactivity/equality.js';

/** @returns {import('../../types.js').KeyBlock} */
function create_key_block() {
	return {
		// dom
		d: null,
		// effect
		e: null,
		// parent
		p: /** @type {import('../../types.js').Block} */ (current_block),
		// transition
		r: null,
		// type
		t: KEY_BLOCK
	};
}

/**
 * @template V
 * @param {Comment} anchor_node
 * @param {() => V} key
 * @param {(anchor: Node) => void} render_fn
 * @returns {void}
 */
export function key_block(anchor_node, key, render_fn) {
	const block = create_key_block();

	/** @type {null | import('../../types.js').Render} */
	let current_render = null;
	hydrate_block_anchor(anchor_node);

	/** @type {V | typeof UNINITIALIZED} */
	let key_value = UNINITIALIZED;
	let mounted = false;
	block.r =
		/**
		 * @param {import('../../types.js').Transition} transition
		 * @returns {void}
		 */
		(transition) => {
			const render = /** @type {import('../../types.js').Render} */ (current_render);
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
						destroy_signal(render.e);
						render.e = null;
					}
				}
			});
		};
	const create_render_effect = () => {
		/** @type {import('../../types.js').Render} */
		const render = {
			d: null,
			e: null,
			s: new Set(),
			p: current_render
		};
		const effect = render_effect(
			() => {
				render_fn(anchor_node);
				render.d = block.d;
				block.d = null;
			},
			block,
			true,
			true
		);
		render.e = effect;
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
			trigger_transitions(transitions, 'out');
			create_render_effect();
		}
	};
	const key_effect = render_effect(
		() => {
			const prev_key_value = key_value;
			key_value = key();
			if (mounted && safe_not_equal(prev_key_value, key_value)) {
				render();
			}
		},
		block,
		false
	);
	// To ensure topological ordering of the key effect to the render effect,
	// we trigger the effect after.
	render();
	mounted = true;
	push_destroy_fn(key_effect, () => {
		let render = current_render;
		while (render !== null) {
			const dom = render.d;
			if (dom !== null) {
				remove(dom);
			}
			const effect = render.e;
			if (effect !== null) {
				destroy_signal(effect);
			}
			render = render.p;
		}
	});
	block.e = key_effect;
}
