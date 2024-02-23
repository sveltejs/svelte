import { noop } from '../../../common.js';
import { destroy_effect, pause_effect, render_effect } from '../../reactivity/computations.js';
import { untrack } from '../../runtime.js';

/**
 * @param {() => Function} get_snippet
 * @param {Node} node
 * @param {(() => any)[]} args
 * @returns {void}
 */
export function snippet_effect(get_snippet, node, ...args) {
	/** @type {import('../../types.js').EffectSignal | null} */
	let effect;

	render_effect(() => {
		// Only rerender when the snippet function itself changes,
		// not when an eagerly-read prop inside the snippet function changes
		const snippet = get_snippet();

		if (effect) {
			pause_effect(effect, noop); // TODO we want to just destroy immediately
			destroy_effect(effect);
		}

		effect = render_effect(() => untrack(() => snippet(node, ...args)), true);
	});
}
