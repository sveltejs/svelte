import { is_promise } from '../../../common.js';
import { hydrate_block_anchor } from '../hydration.js';
import { remove } from '../reconciler.js';
import {
	current_block,
	current_component_context,
	flushSync,
	set_current_component_context,
	set_current_effect,
	set_current_reaction
} from '../../runtime.js';
import { destroy_effect, pause_effect, render_effect } from '../../reactivity/effects.js';

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
		n: true
	};
}

/**
 * @template V
 * @param {Comment} anchor_node
 * @param {(() => Promise<V>)} get_input
 * @param {null | ((anchor: Node) => void)} pending_fn
 * @param {null | ((anchor: Node, value: V) => void)} then_fn
 * @param {null | ((anchor: Node, error: unknown) => void)} catch_fn
 * @returns {void}
 */
export function await_block(anchor_node, get_input, pending_fn, then_fn, catch_fn) {
	const block = create_await_block();

	const component_context = current_component_context;

	hydrate_block_anchor(anchor_node);

	/** @type {any} */
	let input;

	/** @type {import('#client').Effect | null} */
	let pending_effect;

	/** @type {import('#client').Effect | null} */
	let then_effect;

	/** @type {import('#client').Effect | null} */
	let catch_effect;

	// TODO tidy this up
	/** @type {{ d?: any } | null} */
	let pending_block;

	/** @type {{ d?: any } | null} */
	let then_block;

	/** @type {{ d?: any } | null} */
	let catch_block;

	/**
	 * @param {(anchor: Comment, value: any) => void} fn
	 * @param {any} value
	 * @param {any} block
	 */
	function create_effect(fn, value, block) {
		set_current_effect(branch);
		set_current_reaction(branch); // TODO do we need both?
		set_current_component_context(component_context);
		var effect = render_effect(() => fn(anchor_node, value), block, true);
		set_current_component_context(null);
		set_current_reaction(null);
		set_current_effect(null);

		flushSync(); // TODO remove this, just flush at the end of the then/catch

		return effect;
	}

	function pause(effect, block) {
		pause_effect(effect, () => {
			// TODO make this unnecessary
			const dom = block?.d;
			if (dom) remove(dom);
		});
	}

	const branch = render_effect(() => {
		if (input === (input = get_input())) return;

		if (is_promise(input)) {
			const promise = /** @type {Promise<any>} */ (input);

			if (pending_fn) {
				pending_effect = render_effect(() => pending_fn(anchor_node), (pending_block = {}), true);
			}

			if (then_effect) {
				pause(then_effect, then_block);
			}

			if (catch_effect) {
				pause(catch_effect, catch_block);
			}

			promise
				.then((value) => {
					if (promise !== input) return;

					console.log('in then');

					flushSync(); // TODO this feels weird but is apparently necessary (should it go at the bottom?)

					if (pending_effect) {
						console.log('pausing', pending_block.d);
						pause(pending_effect, pending_block);
					}

					if (then_fn) {
						then_effect = create_effect(then_fn, value, (then_block = {}));
					}
				})
				.catch(() => {});

			promise.catch((error) => {
				if (promise !== input) return;

				flushSync(); // TODO this feels weird but is apparently necessary

				if (pending_effect) {
					pause(pending_effect, pending_block);
				}

				if (catch_fn) {
					catch_effect = create_effect(catch_fn, error, (catch_block = {}));
				}
			});
		} else {
			if (pending_effect) {
				pause(pending_effect, pending_block);
			}

			if (then_effect) {
				destroy_effect(then_effect);
				if (then_block?.d) remove(then_block.d);
			}

			if (then_fn) {
				then_effect = render_effect(() => then_fn(anchor_node, input), (then_block = {}), true);
			}

			if (catch_effect) {
				pause(catch_effect, catch_block);
			}
		}
	}, block);

	branch.ondestroy = () => {
		if (block.d) {
			remove(block.d);
		}

		// TODO this sucks, tidy it up
		if (pending_block?.d) {
			remove(pending_block.d);
		}

		if (then_block?.d) {
			remove(then_block.d);
		}

		if (catch_block?.d) {
			remove(catch_block.d);
		}
	};
}
