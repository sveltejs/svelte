import { hydrating } from '../hydration.js';
import { set_class_name } from '../operations.js';
import { render_effect } from '../../reactivity/effects.js';

/**
 * @param {Element} dom
 * @param {() => string} value
 * @returns {void}
 */
export function class_name_effect(dom, value) {
	render_effect(() => {
		class_name(dom, value());
	});
}

/**
 * @param {Element} dom
 * @param {string} value
 * @returns {void}
 */
export function class_name(dom, value) {
	// @ts-expect-error need to add __className to patched prototype
	var prev_class_name = dom.__className;
	var next_class_name = to_class(value);

	if (hydrating && dom.className === next_class_name) {
		// In case of hydration don't reset the class as it's already correct.
		// @ts-expect-error need to add __className to patched prototype
		dom.__className = next_class_name;
	} else if (
		prev_class_name !== next_class_name ||
		(hydrating && dom.className !== next_class_name)
	) {
		if (next_class_name === '') {
			dom.removeAttribute('class');
		} else {
			set_class_name(dom, next_class_name);
		}

		// @ts-expect-error need to add __className to patched prototype
		dom.__className = next_class_name;
	}
}

/**
 * @template V
 * @param {V} value
 * @returns {string | V}
 */
export function to_class(value) {
	return value == null ? '' : value;
}

/**
 * @param {Element} dom
 * @param {string} class_name
 * @param {boolean} value
 * @returns {void}
 */
export function class_toggle(dom, class_name, value) {
	if (value) {
		dom.classList.add(class_name);
	} else {
		dom.classList.remove(class_name);
	}
}

/**
 * @param {Element} dom
 * @param {string} class_name
 * @param {() => boolean} value
 * @returns {void}
 */
export function class_toggle_effect(dom, class_name, value) {
	render_effect(() => {
		class_toggle(dom, class_name, value());
	});
}
