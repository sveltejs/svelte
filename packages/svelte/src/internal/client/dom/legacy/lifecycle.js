/** @import { ComponentContextLegacy } from '#client' */
import { run, run_all } from '../../../shared/utils.js';
import { user_pre_effect, user_effect } from '../../reactivity/effects.js';
import { component_context, deep_read_state, get, untrack } from '../../runtime.js';

/**
 * Legacy-mode only: Call `onMount` callbacks and set up `beforeUpdate`/`afterUpdate` effects
 */
export function init() {
	const context = /** @type {ComponentContextLegacy} */ (component_context);

	const callbacks = context.l.u;
	if (!callbacks) return;

	// beforeUpdate
	if (callbacks.b.length) {
		user_pre_effect(() => {
			observe_all(context);
			run_all(callbacks.b);
		});
	}

	// onMount (must run before afterUpdate)
	user_effect(() => {
		const fns = untrack(() => callbacks.m.map(run));
		return () => {
			for (const fn of fns) {
				if (typeof fn === 'function') {
					fn();
				}
			}
		};
	});

	// afterUpdate
	if (callbacks.a.length) {
		user_effect(() => {
			observe_all(context);
			run_all(callbacks.a);
		});
	}
}

/**
 * Invoke the getter of all signals associated with a component
 * so they can be registered to the effect this function is called in.
 * @param {ComponentContextLegacy} context
 */
function observe_all(context) {
	if (context.l.s) {
		for (const signal of context.l.s) get(signal);
	}

	deep_read_state(context.s);
}
