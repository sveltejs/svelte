// Utilities for managing contenteditable nodes 
import Attribute from '../nodes/Attribute';
import Binding from '../nodes/Binding';
import Element from '../nodes/Element';


export const CONTENTEDITABLE_ATTR = 'contenteditable';

export const CONTENTEDITABLE_BINDINGS = [
  'textContent',
  'innerHTML',
  'innerText',
];

/**
 * Returns true if node is an 'input' or 'textarea'
 * @param node The element to be checked
 */
export function isInputOrTextarea(node: Element): boolean {
  return node.name === 'textarea' || node.name === 'input';
}

/**
 * Check if a given attribute is 'contenteditable'
 * @param attribute A node.attribute
 */
export function isAttrContentEditable(attribute: Attribute): boolean {
  return attribute.name === CONTENTEDITABLE_ATTR;
}

/**
 * Check if any of a node's attributes are 'contentenditable'
 * @param node The element to be checked
 */
export function hasContentEditableAttr(node: Element): boolean {
  return node.attributes.some(isAttrContentEditable);
}

/**
 * Returns true if node is not textarea or input, but has 'contenteditable' attribute
 * @param node The element to be tested
 */
export default function isContenteditable(node: Element): boolean {
  return !isInputOrTextarea(node) && hasContentEditableAttr(node);
}

/**
 * Returns true if a given bindings should be contenteditable
 * 
 * @param binding A node's binding to be checked
 */
export function isBindingContenteditable(binding: Binding) {
  return CONTENTEDITABLE_BINDINGS.includes(binding.name);
}
