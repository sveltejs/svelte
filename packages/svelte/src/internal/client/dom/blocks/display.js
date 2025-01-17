import { UNINITIALIZED } from '../../../../constants.js';
import { block, template_effect } from '../../reactivity/effects.js';
import { hydrate_next, hydrate_node, hydrating } from '../hydration.js';

/**
 * @template V
 * @param {HTMLElement} node
 * @param {() => any} get_visibility
 * @param {() => void} render_fn
 * @param {()=>string|boolean|null} [get_value]
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

	// special case when style:display is missing
	// we get the style value from the node :
	if (get_value === undefined) {
		/** @type {string | null} */
		let anchor_display = null;
		get_value = () => {
			if (prev_visible !== false) {
				anchor_display = anchor.style.display || null;
				if (anchor_display) {
					default_important = anchor.style.getPropertyPriority('display') === 'important';
				}
			}
			return anchor_display;
		};
	}

	const effect = block(render_fn);
	template_effect(() => {
		let display_value = get_value?.();
		if (display_value === true) {
			display_value = null;
		} else if (display_value === false) {
			display_value = 'none';
		}
		const visible = get_visibility !== null ? !!get_visibility() : display_value !== 'none';
		const value = visible ? display_value : 'none';

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
