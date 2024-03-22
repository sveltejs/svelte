import { is_promise } from '../../../common.js';
import { hydrate_block_anchor } from '../hydration.js';
import { remove } from '../reconciler.js';
import {
	current_component_context,
	flushSync,
	set_current_component_context,
	set_current_effect,
	set_current_reaction
} from '../../runtime.js';
import { destroy_effect, pause_effect, render_effect } from '../../reactivity/effects.js';
import { DESTROYED, INERT } from '../../constants.js';
import { create_block } from './utils.js';

/**
 * @template V
 * @param {Comment} anchor
 * @param {(() => Promise<V>)} get_input
 * @param {null | ((anchor: Node) => void)} pending_fn
 * @param {null | ((anchor: Node, value: V) => void)} then_fn
 * @param {null | ((anchor: Node, error: unknown) => void)} catch_fn
 * @returns {void}
 */
export function await_block(anchor, get_input, pending_fn, then_fn, catch_fn) {
	const block = create_block();

	const component_context = current_component_context;

	hydrate_block_anchor(anchor);

	/** @type {any} */
	let input;

	/** @type {import('#client').Effect | null} */
	let pending_effect;

	/** @type {import('#client').Effect | null} */
	let then_effect;

	/** @type {import('#client').Effect | null} */
	let catch_effect;

	/**
	 * @param {(anchor: Comment, value: any) => void} fn
	 * @param {any} value
	 */
	function create_effect(fn, value) {
		set_current_effect(branch);
		set_current_reaction(branch); // TODO do we need both?
		set_current_component_context(component_context);
		var effect = render_effect(() => fn(anchor, value), {}, true);
		set_current_component_context(null);
		set_current_reaction(null);
		set_current_effect(null);

		// without this, the DOM does not update until two ticks after the promise,
		// resolves which is unexpected behaviour (and somewhat irksome to test)
		flushSync();

		return effect;
	}

	/** @param {import('#client').Effect} effect */
	function pause(effect) {
		if ((effect.f & DESTROYED) !== 0) return;
		const block = effect.block;

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
				if (pending_effect && (pending_effect.f & INERT) === 0) {
					if (pending_effect.block?.d) remove(pending_effect.block.d);
					destroy_effect(pending_effect);
				}

				pending_effect = render_effect(() => pending_fn(anchor), {}, true);
			}

			if (then_effect) pause(then_effect);
			if (catch_effect) pause(catch_effect);

			promise.then(
				(value) => {
					if (promise !== input) return;
					if (pending_effect) pause(pending_effect);

					if (then_fn) {
						then_effect = create_effect(then_fn, value);
					}
				},
				(error) => {
					if (promise !== input) return;
					if (pending_effect) pause(pending_effect);

					if (catch_fn) {
						catch_effect = create_effect(catch_fn, error);
					}
				}
			);
		} else {
			if (pending_effect) pause(pending_effect);
			if (catch_effect) pause(catch_effect);

			if (then_fn) {
				if (then_effect) {
					if (then_effect.block?.d) remove(then_effect.block.d);
					destroy_effect(then_effect);
				}

				then_effect = render_effect(() => then_fn(anchor, input), {}, true);
			}
		}
	}, block);

	branch.ondestroy = () => {
		// TODO this sucks, tidy it up
		if (pending_effect?.block?.d) remove(pending_effect.block.d);
		if (then_effect?.block?.d) remove(then_effect.block.d);
		if (catch_effect?.block?.d) remove(catch_effect.block.d);
	};
}
