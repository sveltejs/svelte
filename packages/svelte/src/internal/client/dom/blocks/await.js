import { is_promise } from '../../../common.js';
import { AWAIT_BLOCK } from '../../block.js';
import { hydrate_block_anchor } from '../../hydration.js';
import { remove } from '../../reconciler.js';
import {
	UNINITIALIZED,
	current_block,
	destroy_signal,
	execute_effect,
	flushSync,
	push_destroy_fn,
	render_effect
} from '../../runtime.js';
import { trigger_transitions } from '../../transitions.js';

/** @returns {import('../../types.js').AwaitBlock} */
export function create_await_block() {
	return {
		// dom
		d: null,
		// effect
		e: null,
		// parent
		p: /** @type {import('../../types.js').Block} */ (current_block),
		// pending
		n: true,
		// transition
		r: null,
		// type
		t: AWAIT_BLOCK
	};
}

/**
 * @template V
 * @param {Comment} anchor_node
 * @param {(() => Promise<V>)} input
 * @param {null | ((anchor: Node) => void)} pending_fn
 * @param {null | ((anchor: Node, value: V) => void)} then_fn
 * @param {null | ((anchor: Node, error: unknown) => void)} catch_fn
 * @returns {void}
 */
export function await_block(anchor_node, input, pending_fn, then_fn, catch_fn) {
	const block = create_await_block();

	/** @type {null | import('../../types.js').Render} */
	let current_render = null;
	hydrate_block_anchor(anchor_node);

	/** @type {{}} */
	let latest_token;

	/** @type {typeof UNINITIALIZED | V} */
	let resolved_value = UNINITIALIZED;

	/** @type {unknown} */
	let error = UNINITIALIZED;
	let pending = false;
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
				if (error === UNINITIALIZED) {
					if (resolved_value === UNINITIALIZED) {
						// pending = true
						block.n = true;
						if (pending_fn !== null) {
							pending_fn(anchor_node);
						}
					} else if (then_fn !== null) {
						// pending = false
						block.n = false;
						then_fn(anchor_node, resolved_value);
					}
				} else if (catch_fn !== null) {
					// pending = false
					block.n = false;
					catch_fn(anchor_node, error);
				}
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
			create_render_effect();
			trigger_transitions(transitions, 'out');
		}
	};
	const await_effect = render_effect(
		() => {
			const token = {};
			latest_token = token;
			const promise = input();
			if (is_promise(promise)) {
				promise.then(
					/** @param {V} v */
					(v) => {
						if (latest_token === token) {
							// Ensure UI is in sync before resolving value.
							flushSync();
							resolved_value = v;
							pending = false;
							render();
						}
					},
					/** @param {unknown} _error */
					(_error) => {
						error = _error;
						pending = false;
						render();
					}
				);
				if (resolved_value !== UNINITIALIZED || error !== UNINITIALIZED) {
					error = UNINITIALIZED;
					resolved_value = UNINITIALIZED;
				}
				if (!pending) {
					pending = true;
					render();
				}
			} else {
				error = UNINITIALIZED;
				resolved_value = promise;
				pending = false;
				render();
			}
		},
		block,
		false
	);
	push_destroy_fn(await_effect, () => {
		let render = current_render;
		latest_token = {};
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
	block.e = await_effect;
}
