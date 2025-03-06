/** @import { Effect, Source, TemplateNode } from '#client' */
import { DEV } from 'esm-env';
import { is_promise } from '../../../shared/utils.js';
import { block, branch, pause_effect, resume_effect } from '../../reactivity/effects.js';
import { internal_set, mutable_source, source } from '../../reactivity/sources.js';
import { flushSync, set_active_effect, set_active_reaction } from '../../runtime.js';
import { hydrate_next, hydrate_node, hydrating } from '../hydration.js';
import { queue_micro_task } from '../task.js';
import { UNINITIALIZED } from '../../../../constants.js';
import {
	component_context,
	is_runes,
	set_component_context,
	set_dev_current_component_function
} from '../../context.js';

const PENDING = 0;
const THEN = 1;
const CATCH = 2;

/**
 * @template V
 * @param {TemplateNode} node
 * @param {(() => Promise<V>)} get_input
 * @param {null | ((anchor: Node) => void)} pending_fn
 * @param {null | ((anchor: Node, value: Source<V>) => void)} then_fn
 * @param {null | ((anchor: Node, error: unknown) => void)} catch_fn
 * @returns {void}
 */
export function await_block(node, get_input, pending_fn, then_fn, catch_fn) {
	if (hydrating) {
		hydrate_next();
	}

	var anchor = node;
	var runes = is_runes();
	var active_component_context = component_context;

	/** @type {any} */
	var component_function = DEV ? component_context?.function : null;

	/** @type {V | Promise<V> | typeof UNINITIALIZED} */
	var input = UNINITIALIZED;

	/** @type {Effect | null} */
	var pending_effect;

	/** @type {Effect | null} */
	var then_effect;

	/** @type {Effect | null} */
	var catch_effect;

	var input_source = (runes ? source : mutable_source)(/** @type {V} */ (undefined));
	var error_source = (runes ? source : mutable_source)(undefined);
	var resolved = false;

	/**
	 * @param {PENDING | THEN | CATCH} state
	 * @param {boolean} restore
	 */
	function update(state, restore) {
		resolved = true;

		if (restore) {
			set_active_effect(effect);
			set_active_reaction(effect); // TODO do we need both?
			set_component_context(active_component_context);
			if (DEV) set_dev_current_component_function(component_function);
		}

		try {
			if (state === PENDING && pending_fn) {
				if (pending_effect) resume_effect(pending_effect);
				else pending_effect = branch(() => pending_fn(anchor));
			}

			if (state === THEN && then_fn) {
				if (then_effect) resume_effect(then_effect);
				else then_effect = branch(() => then_fn(anchor, input_source));
			}

			if (state === CATCH && catch_fn) {
				if (catch_effect) resume_effect(catch_effect);
				else catch_effect = branch(() => catch_fn(anchor, error_source));
			}

			if (state !== PENDING && pending_effect) {
				pause_effect(pending_effect, () => (pending_effect = null));
			}

			if (state !== THEN && then_effect) {
				pause_effect(then_effect, () => (then_effect = null));
			}

			if (state !== CATCH && catch_effect) {
				pause_effect(catch_effect, () => (catch_effect = null));
			}
		} finally {
			if (restore) {
				if (DEV) set_dev_current_component_function(null);
				set_component_context(null);
				set_active_reaction(null);
				set_active_effect(null);

				// without this, the DOM does not update until two ticks after the promise
				// resolves, which is unexpected behaviour (and somewhat irksome to test)
				flushSync();
			}
		}
	}

	var effect = block(() => {
		if (input === (input = get_input())) return;

		if (is_promise(input)) {
			var promise = input;

			resolved = false;

			promise.then(
				(value) => {
					if (promise !== input) return;
					// we technically could use `set` here since it's on the next microtick
					// but let's use internal_set for consistency and just to be safe
					internal_set(input_source, value);
					update(THEN, true);
				},
				(error) => {
					if (promise !== input) return;
					// we technically could use `set` here since it's on the next microtick
					// but let's use internal_set for consistency and just to be safe
					internal_set(error_source, error);
					update(CATCH, true);
					if (!catch_fn) {
						// Rethrow the error if no catch block exists
						throw error_source.v;
					}
				}
			);

			if (hydrating) {
				if (pending_fn) {
					pending_effect = branch(() => pending_fn(anchor));
				}
			} else {
				// Wait a microtask before checking if we should show the pending state as
				// the promise might have resolved by the next microtask.
				queue_micro_task(() => {
					if (!resolved) update(PENDING, true);
				});
			}
		} else {
			internal_set(input_source, input);
			update(THEN, false);
		}

		// Set the input to something else, in order to disable the promise callbacks
		return () => (input = UNINITIALIZED);
	});

	if (hydrating) {
		anchor = hydrate_node;
	}
}
