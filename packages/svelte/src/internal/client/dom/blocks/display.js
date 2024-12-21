import { UNINITIALIZED } from '../../../../constants.js';
import { block, template_effect } from '../../reactivity/effects.js';
import { hydrate_next, hydrate_node, hydrating } from '../hydration.js';

/**
 * @template V
 * @param {HTMLElement} node
 * @param {() => any} get_visibility
 * @param {() => void} render_fn
 * @param {()=>string|null} [get_value]
 * @param {boolean} [default_important]
 * @returns {void}
 */
export function display(node, get_visibility, render_fn, get_value, default_important) {
	if (hydrating) {
		hydrate_next();
	}

	var anchor = node;

	/** @type {boolean | typeof UNINITIALIZED} */
	let prev_visible = UNINITIALIZED;
	/** @type {string | null | undefined | typeof UNINITIALIZED} */
	let prev_value = UNINITIALIZED;

	const effect = block(render_fn);
	template_effect(() => {
		const visible = !!get_visibility();
		const value = visible ? get_value?.() : 'none';

		if (visible === prev_visible && value === prev_value) {
			return;
		}

		const transitions = effect.transitions;
		const run_transitions = prev_visible !== UNINITIALIZED && transitions?.length;

		if (visible || !run_transitions) {
			if (value == null) {
				anchor.style.removeProperty('display');
			} else {
				anchor.style.setProperty(
					'display',
					value,
					!visible || default_important ? 'important' : ''
				);
			}
		}

		if (run_transitions) {
			if (visible) {
				// Start show transition
				for (const transition of transitions) {
					transition.in();
				}
			} else {
				var remaining = transitions.length;
				var check = () => {
					if (--remaining == 0) {
						// cleanup
						for (var transition of transitions) {
							transition.stop();
						}
						anchor.style.setProperty('display', 'none', 'important');
					}
				};
				for (var transition of transitions) {
					transition.out(check);
				}
			}
		}

		prev_visible = visible;
		prev_value = value;
	});

	if (hydrating) {
		anchor = /** @type {HTMLElement} */ (hydrate_node);
	}
}
