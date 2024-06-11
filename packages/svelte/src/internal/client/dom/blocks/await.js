import { is_promise, noop } from '../../../shared/utils.js';
import {
	current_component_context,
	current_effect,
	current_reaction,
	flush_sync,
	set_current_component_context,
	set_current_effect,
	set_current_reaction,
	set_dev_current_component_function
} from '../../runtime.js';
import { block, branch, destroy_effect, pause_effect } from '../../reactivity/effects.js';
import { INERT } from '../../constants.js';
import { DEV } from 'esm-env';
import { queue_micro_task } from '../task.js';
import { hydrating } from '../hydration.js';

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
	const component_context = current_component_context;
	/** @type {any} */
	let component_function;
	if (DEV) {
		component_function = component_context?.function ?? null;
	}

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
		set_current_effect(effect);
		set_current_reaction(effect); // TODO do we need both?
		set_current_component_context(component_context);
		if (DEV) {
			set_dev_current_component_function(component_function);
		}
		var e = branch(() => fn(anchor, value));
		if (DEV) {
			set_dev_current_component_function(null);
		}
		set_current_component_context(null);
		set_current_reaction(null);
		set_current_effect(null);

		// without this, the DOM does not update until two ticks after the promise,
		// resolves which is unexpected behaviour (and somewhat irksome to test)
		flush_sync();

		return e;
	}

	const effect = block(() => {
		if (input === (input = get_input())) return;

		if (is_promise(input)) {
			const promise = /** @type {Promise<any>} */ (input);
			var resolved = false;

			promise.then(
				(value) => {
					if (promise !== input) return;
					resolved = true;
					if (pending_effect) pause_effect(pending_effect);

					if (then_fn) {
						then_effect = create_effect(then_fn, value);
					}
				},
				(error) => {
					if (promise !== input) return;
					if (pending_effect) pause_effect(pending_effect);

					if (catch_fn) {
						catch_effect = create_effect(catch_fn, error);
					}
				}
			);

			if (pending_fn) {
				var parent_effect = current_effect;
				var parent_reaction = current_reaction;
				var show_pending = () => {
					if (resolved) return;
					if (pending_effect && (pending_effect.f & INERT) === 0) {
						destroy_effect(pending_effect);
					}
					var previous_effect = current_effect;
					var previous_reaction = current_reaction;
					try {
						set_current_effect(parent_effect);
						set_current_reaction(parent_reaction);
						pending_effect = branch(() => pending_fn(anchor));
					} finally {
						set_current_effect(previous_effect);
						set_current_reaction(previous_reaction);
					}
				};
				if (hydrating) {
					show_pending();
				} else {
					// Wait a microtask before checking if we should the pending state as
					// the promise might have resolved by the next microtask.
					queue_micro_task(show_pending);
				}
			}

			if (then_effect) pause_effect(then_effect);
			if (catch_effect) pause_effect(catch_effect);
		} else {
			if (pending_effect) pause_effect(pending_effect);
			if (catch_effect) pause_effect(catch_effect);

			if (then_fn) {
				if (then_effect) {
					destroy_effect(then_effect);
				}

				then_effect = branch(() => then_fn(anchor, input));
			}
		}

		// Inert effects are proactively detached from the effect tree. Returning a noop
		// teardown function is an easy way to ensure that this is not discarded
		return noop;
	});
}
