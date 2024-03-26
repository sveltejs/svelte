import { run } from '../../../common.js';
import { user_pre_effect, user_effect } from '../../reactivity/effects.js';
import {
	current_component_context,
	current_effect,
	deep_read_state,
	flush_local_render_effects,
	get,
	untrack
} from '../../runtime.js';

/**
 * Legacy-mode only: Call `onMount` callbacks and set up `beforeUpdate`/`afterUpdate` effects
 */
export function init() {
	const context = /** @type {import('#client').ComponentContext} */ (current_component_context);
	const callbacks = context.u;

	if (!callbacks) return;

	// beforeUpdate
	if (callbacks.b.length) {
		user_pre_effect(() => {
			observe_all(context);
			callbacks.b.forEach(run);
			// beforeUpdate might change state that affects rendering, ensure the render effects following from it
			// are batched up with the current run. Avoids for example child components rerunning when they're
			// now hidden because beforeUpdate did set an if block to false.
			const parent = current_effect?.parent;
			if (parent != null) {
				flush_local_render_effects(parent);
			}
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
			callbacks.a.forEach(run);
		});
	}
}

/**
 * Invoke the getter of all signals associated with a component
 * so they can be registered to the effect this function is called in.
 * @param {import('#client').ComponentContext} context
 */
function observe_all(context) {
	if (context.d) {
		for (const signal of context.d) get(signal);
	}

	deep_read_state(context.s);
}
