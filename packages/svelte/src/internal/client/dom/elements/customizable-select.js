import { teardown } from '../../reactivity/effects.js';
import { hydrating, reset, set_hydrate_node, set_hydrating } from '../hydration.js';
import { create_comment } from '../operations.js';
import { queue_micro_task } from '../task.js';
import { attach } from './attachments.js';

/** @type {boolean | null} */
let supported = null;

/**
 * Checks if the browser supports rich HTML content inside `<option>` elements.
 * Modern browsers preserve HTML elements inside options, while older browsers
 * strip them during parsing, leaving only text content.
 * @returns {boolean}
 */
function is_supported() {
	if (supported === null) {
		var select = document.createElement('select');
		select.innerHTML = '<option><span>t</span></option>';
		supported = /** @type {Element} */ (select.firstChild)?.firstChild?.nodeType === 1;
	}

	return supported;
}

/**
 * @param {Node} node
 * @param {string} tag_name
 */
function find_in_path(node, tag_name) {
	/**
	 * @type {HTMLElement | undefined | null}
	 */
	let parent = /** @type {HTMLElement} */ (node);
	while (parent && parent.tagName !== tag_name) {
		parent = parent.parentElement;
	}
	return parent;
}

/**
 *
 * @param {HTMLElement} element
 */
export function selectedcontent(element) {
	// if it's not supported no need for special logic
	if (!CSS.supports('appearance: base-select')) return;

	// we use the attach function directly just to make sure is executed when is mounted to the dom
	attach(element, () => () => {
		const select = /** @type {HTMLSelectElement | null} */ (find_in_path(element, 'SELECT'));
		if (select) {
			const observer = new MutationObserver((entries) => {
				// if the changes include SELECTEDCONTENT we don't need to do anything as it already changed
				if (
					entries.some(
						(el) => el.target instanceof HTMLElement && el.target.tagName === 'SELECTEDCONTENT'
					)
				) {
					return;
				}
				// if the changes doesn't include the selected options we don't need to do anything
				if (
					!entries.find((e) => {
						const option = /** @type {HTMLOptionElement | null} */ (
							find_in_path(e.target, 'OPTION')
						);
						return option && [...select.selectedOptions].includes(option);
					})
				) {
					return;
				}
				// otherwise we replace selectedcontent with a new element to trigger the browser
				// reclone of the selected option
				element.replaceWith((element = document.createElement('selectedcontent')));
			});

			observer.observe(select, {
				childList: true,
				characterData: true,
				subtree: true
			});

			teardown(() => {
				observer.disconnect();
			});
		}
	});
}

/**
 * Handles rich HTML content inside `<option>`, `<optgroup>`, or `<select>` elements with browser-specific branching.
 * Modern browsers preserve HTML inside options, while older browsers strip it to text only.
 *
 * @param {HTMLOptionElement | HTMLOptGroupElement | HTMLSelectElement} element The element to process
 * @param {() => void} rich_fn Function to process rich HTML content (modern browsers)
 */
export function customizable_select(element, rich_fn) {
	var was_hydrating = hydrating;

	if (!is_supported()) {
		set_hydrating(false);
		element.textContent = '';
		element.append(create_comment(''));
	}

	try {
		rich_fn();
	} finally {
		if (was_hydrating) {
			if (hydrating) {
				reset(element);
			} else {
				set_hydrating(true);
				set_hydrate_node(element);
			}
		}
	}
}
