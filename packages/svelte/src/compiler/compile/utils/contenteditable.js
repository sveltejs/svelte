// Utilities for managing contenteditable nodes

/** @typedef {import('../nodes/Attribute.js').default} Attribute */
/** @typedef {import('../nodes/Element.js').default} Element */

export const CONTENTEDITABLE_BINDINGS = ['textContent', 'innerHTML', 'innerText'];

/**
 * Returns true if node is an 'input' or 'textarea'.
 * @param {Element} node The element to be checked
 */
function is_input_or_textarea(node) {
	return node.name === 'textarea' || node.name === 'input';
}

/**
 * Check if a given attribute is 'contenteditable'.
 * @param {Attribute} attribute A node.attribute
 */
function is_attr_contenteditable(attribute) {
	return attribute.name === 'contenteditable';
}

/**
 * Check if any of a node's attributes are 'contentenditable'.
 * @param {Element} node The element to be checked
 */
export function has_contenteditable_attr(node) {
	return node.attributes.some(is_attr_contenteditable);
}

/**
 * Returns true if node is not textarea or input, but has 'contenteditable' attribute.
 * @param {Element} node The element to be tested
 */
export function is_contenteditable(node) {
	return !is_input_or_textarea(node) && has_contenteditable_attr(node);
}

/**
 * Returns true if a given binding/node is contenteditable.
 * @param {string} name A binding or node name to be checked
 */
export function is_name_contenteditable(name) {
	return CONTENTEDITABLE_BINDINGS.includes(name);
}

/**
 * Returns the contenteditable attribute from the node (if it exists).
 * @param {Element} node The element to get the attribute from
 */
export function get_contenteditable_attr(node) {
	return node.attributes.find(is_attr_contenteditable);
}
