/**
 * @import { TemplateOperations } from "../types.js"
 * @import { ObjectExpression, Identifier, ArrayExpression, Property, Expression, Literal } from "estree"
 */
import * as b from '../../../../utils/builders.js';
import { regex_is_valid_identifier } from '../../../patterns.js';
import fix_attribute_casing from './fix-attribute-casing.js';

/**
 * @param {TemplateOperations} items
 */
export function template_to_functions(items) {
	let elements = b.array([]);

	/**
	 * @type {Array<Element>}
	 */
	let elements_stack = [];

	/**
	 * @type {Element | undefined}
	 */
	let last_current_element;

	// if the first item is a comment we need to add another comment for effect.start
	if (items[0].kind === 'create_anchor') {
		items.unshift({ kind: 'create_anchor' });
	}

	for (let instruction of items) {
		const last_element_stack = /** @type {Element} */ (elements_stack.at(-1));
		/**
		 * @param {Expression | null | void} value
		 * @returns
		 */
		function push(value) {
			if (value === undefined) return;
			if (last_element_stack) {
				insert(last_element_stack, value);
			} else {
				elements.elements.push(value);
			}
		}

		switch (instruction.kind) {
			case 'push_element':
				elements_stack.push(/** @type {Element} */ (last_current_element));
				break;
			case 'pop_element':
				elements_stack.pop();
				last_current_element = elements_stack.at(-1);
				break;
			case 'create_element':
				last_current_element = create_element(instruction.name);
				push(last_current_element);
				break;
			case 'create_text':
				push(create_text(last_element_stack, instruction.nodes.map((node) => node.data).join('')));
				break;
			case 'create_anchor':
				push(create_anchor(last_element_stack, instruction.data));
				break;
			case 'set_prop':
				set_prop(/** @type {Element} */ (last_current_element), instruction.key, instruction.value);
				break;
		}
	}

	return elements;
}

/**
 * @typedef {ObjectExpression} Element
 */

/**
 * @typedef {void | null | ArrayExpression} Anchor
 */

/**
 * @typedef {void | Literal} Text
 */

/**
 * @typedef { Element | Anchor| Text } Node
 */

/**
 * @param {string} element
 * @returns {Element}
 */
function create_element(element) {
	return b.object([b.prop('init', b.id('e'), b.literal(element))]);
}

/**
 *
 * @param {Element} element
 * @param {string} name
 * @param {Expression} init
 * @returns {Property}
 */
function get_or_create_prop(element, name, init) {
	let prop = element.properties.find(
		(prop) => prop.type === 'Property' && /** @type {Identifier} */ (prop.key).name === name
	);
	if (!prop) {
		prop = b.prop('init', b.id(name), init);
		element.properties.push(prop);
	}
	return /** @type {Property} */ (prop);
}

/**
 * @param {Element} element
 * @param {string} data
 * @returns {Anchor}
 */
function create_anchor(element, data = '') {
	if (!element) return data ? b.array([b.literal(data)]) : null;
	const c = get_or_create_prop(element, 'c', b.array([]));
	/** @type {ArrayExpression} */ (c.value).elements.push(data ? b.array([b.literal(data)]) : null);
}

/**
 * @param {Element} element
 * @param {string} value
 * @returns {Text}
 */
function create_text(element, value) {
	if (!element) return b.literal(value);
	const c = get_or_create_prop(element, 'c', b.array([]));
	/** @type {ArrayExpression} */ (c.value).elements.push(b.literal(value));
}

/**
 *
 * @param {Element} element
 * @param {string} prop
 * @param {string | undefined} value
 */
function set_prop(element, prop, value) {
	const p = get_or_create_prop(element, 'p', b.object([]));

	if (prop === 'is') {
		element.properties.push(b.prop('init', b.id(prop), b.literal(/** @type {string} */ (value))));
		return;
	}

	const prop_correct_case = fix_attribute_casing(prop);

	const is_valid_id = regex_is_valid_identifier.test(prop_correct_case);

	/** @type {ObjectExpression} */ (p.value).properties.push(
		b.prop(
			'init',
			(is_valid_id ? b.id : b.literal)(prop_correct_case),
			b.literal(value),
			!is_valid_id
		)
	);
}

/**
 *
 * @param {Element} element
 * @param {Expression | null} child
 */
function insert(element, child) {
	const c = get_or_create_prop(element, 'c', b.array([]));
	/** @type {ArrayExpression} */ (c.value).elements.push(child);
}
