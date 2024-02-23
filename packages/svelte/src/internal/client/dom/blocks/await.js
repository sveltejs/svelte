import { is_promise } from '../../../common.js';
import { hydrate_block_anchor } from '../../hydration.js';
import {
	current_component_context,
	set_current_component_context,
	set_current_effect
} from '../../runtime.js';
import { pause_effect, render_effect, resume_effect } from '../../reactivity/computations.js';
import { BRANCH_EFFECT } from '../../constants.js';

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
	const component_context = current_component_context;

	hydrate_block_anchor(anchor_node);

	/** @type {any} */
	let input;

	/** @type {import('../../types.js').EffectSignal | null} */
	let pending_effect;

	/** @type {import('../../types.js').EffectSignal | null} */
	let then_effect;

	/** @type {import('../../types.js').EffectSignal | null} */
	let catch_effect;

	const branch = render_effect(() => {
		if (input === (input = get_input())) return;

		if (is_promise(input)) {
			const promise = /** @type {Promise<any>} */ (input);

			if (pending_effect) {
				resume_effect(pending_effect);
			} else if (pending_fn) {
				pending_effect = render_effect(() => pending_fn(anchor_node), true);
			}

			if (then_effect) {
				pause_effect(then_effect, () => {
					then_effect = null;
				});
			}

			if (catch_effect) {
				pause_effect(catch_effect, () => {
					catch_effect = null;
				});
			}

			promise
				.then((value) => {
					if (promise !== input) return;

					if (pending_effect) {
						pause_effect(pending_effect, () => {
							pending_effect = null;
						});
					}

					if (then_fn) {
						if (then_effect) {
							resume_effect(then_effect);
						} else if (then_fn) {
							set_current_effect(branch);
							set_current_component_context(component_context);
							then_effect = render_effect(() => then_fn(anchor_node, value), true);
							set_current_component_context(null);
							set_current_effect(null);
						}
					}
				})
				.catch(() => {});

			promise.catch((error) => {
				if (promise !== input) return;

				if (pending_effect) {
					pause_effect(pending_effect, () => {
						pending_effect = null;
					});
				}

				if (catch_fn) {
					if (catch_effect) {
						resume_effect(catch_effect);
					} else if (catch_fn) {
						set_current_effect(branch);
						set_current_component_context(component_context);
						catch_effect = render_effect(() => catch_fn(anchor_node, error), true);
						set_current_component_context(null);
						set_current_effect(null);
					}
				}
			});
		} else {
			if (pending_effect) {
				pause_effect(pending_effect, () => {
					pending_effect = null;
				});
			}

			if (then_effect) {
				resume_effect(then_effect);
			} else if (then_fn) {
				// TODO we need to pass a function in rather than a value, because
				// this will never update
				then_effect = render_effect(() => then_fn(anchor_node, input), true);
			}

			if (catch_effect) {
				pause_effect(catch_effect, () => {
					catch_effect = null;
				});
			}
		}
	});

	branch.f |= BRANCH_EFFECT; // TODO create a primitive for this
}
