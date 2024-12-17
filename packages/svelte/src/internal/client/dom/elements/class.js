import { hydrating } from '../hydration.js';

/**
 * @param {SVGElement} dom
 * @param {string} value
 * @param {string} [hash]
 * @returns {void}
 */
export function set_svg_class(dom, value, hash) {
	// @ts-expect-error need to add __className to patched prototype
	var prev_class_name = dom.__className;
	var next_class_name = to_class(value, hash);

	if (hydrating && dom.getAttribute('class') === next_class_name) {
		// In case of hydration don't reset the class as it's already correct.
		// @ts-expect-error need to add __className to patched prototype
		dom.__className = next_class_name;
	} else if (
		prev_class_name !== next_class_name ||
		(hydrating && dom.getAttribute('class') !== next_class_name)
	) {
		if (next_class_name === '') {
			dom.removeAttribute('class');
		} else {
			dom.setAttribute('class', next_class_name);
		}

		// @ts-expect-error need to add __className to patched prototype
		dom.__className = next_class_name;
	}
}

/**
 * @param {MathMLElement} dom
 * @param {string} value
 * @param {string} [hash]
 * @returns {void}
 */
export function set_mathml_class(dom, value, hash) {
	// @ts-expect-error need to add __className to patched prototype
	var prev_class_name = dom.__className;
	var next_class_name = to_class(value, hash);

	if (hydrating && dom.getAttribute('class') === next_class_name) {
		// In case of hydration don't reset the class as it's already correct.
		// @ts-expect-error need to add __className to patched prototype
		dom.__className = next_class_name;
	} else if (
		prev_class_name !== next_class_name ||
		(hydrating && dom.getAttribute('class') !== next_class_name)
	) {
		if (next_class_name === '') {
			dom.removeAttribute('class');
		} else {
			dom.setAttribute('class', next_class_name);
		}

		// @ts-expect-error need to add __className to patched prototype
		dom.__className = next_class_name;
	}
}

/**
 * @param {HTMLElement} dom
 * @param {string} value
 * @param {string} [hash]
 * @returns {void}
 */
export function set_class(dom, value, hash) {
	// @ts-expect-error need to add __className to patched prototype
	var prev_class_name = dom.__className;
	var next_class_name = to_class(value, hash);

	if (hydrating && dom.className === next_class_name) {
		// In case of hydration don't reset the class as it's already correct.
		// @ts-expect-error need to add __className to patched prototype
		dom.__className = next_class_name;
	} else if (
		prev_class_name !== next_class_name ||
		(hydrating && dom.className !== next_class_name)
	) {
		// Removing the attribute when the value is only an empty string causes
		// peformance issues vs simply making the className an empty string. So
		// we should only remove the class if the the value is nullish.
		if (value == null && !hash) {
			dom.removeAttribute('class');
		} else {
			dom.className = next_class_name;
		}

		// @ts-expect-error need to add __className to patched prototype
		dom.__className = next_class_name;
	}
}

/**
 * @template V
 * @param {V} value
 * @param {string} [hash]
 * @returns {string | V}
 */
function to_class(value, hash) {
	return (value == null ? '' : value) + (hash ? ' ' + hash : '');
}

/**
 * @param {Element} dom
 * @param {string} class_name
 * @param {boolean} value
 * @returns {void}
 */
export function toggle_class(dom, class_name, value) {
	if (value) {
		if (dom.classList.contains(class_name)) return;
		dom.classList.add(class_name);
	} else {
		if (!dom.classList.contains(class_name)) return;
		dom.classList.remove(class_name);
	}
}
