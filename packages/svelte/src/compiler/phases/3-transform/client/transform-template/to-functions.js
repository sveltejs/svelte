/**
 * @import { TemplateOperations } from "../types.js"
 * @import { Namespace } from "#compiler"
 * @import { CallExpression, Statement, ObjectExpression, Identifier, ArrayExpression, Property, Expression, Literal } from "estree"
 */
import { NAMESPACE_SVG, NAMESPACE_MATHML } from '../../../../../constants.js';
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
		// on push element we add the element to the stack, from this moment on every insert will
		// happen on the last element in the stack
		if (instruction.kind === 'push_element' && last_current_element) {
			elements_stack.push(last_current_element);
			continue;
		}
		// we closed one element, we remove it from the stack and eventually revert back
		// the namespace to the previous one
		if (instruction.kind === 'pop_element') {
			elements_stack.pop();
			continue;
		}

		// @ts-expect-error we can't be here if `swap_current_element` but TS doesn't know that
		const value = map[instruction.kind](
			...[
				...(instruction.kind === 'create_element'
					? []
					: [instruction.kind === 'set_prop' ? last_current_element : elements_stack.at(-1)]),
				...(instruction.args ?? [])
			]
		);

		// with set_prop we don't need to do anything else, in all other cases we also need to
		// append the element/node/anchor to the current active element or push it in the elements array
		if (instruction.kind !== 'set_prop') {
			if (elements_stack.length >= 1 && value !== undefined) {
				map.insert(/** @type {Element} */ (elements_stack.at(-1)), value);
			} else if (value !== undefined) {
				elements.elements.push(value);
			}
			// keep track of the last created element (it will be pushed to the stack after the props are set)
			if (instruction.kind === 'create_element') {
				last_current_element = /** @type {Element} */ (value);
			}
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
 * @param {string} value
 */
function set_prop(element, prop, value) {
	const p = get_or_create_prop(element, 'p', b.object([]));

	if (prop === 'is') {
		element.properties.push(b.prop('init', b.id(prop), b.literal(value)));
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
 * @param {Element} child
 */
function insert(element, child) {
	const c = get_or_create_prop(element, 'c', b.array([]));
	/** @type {ArrayExpression} */ (c.value).elements.push(child);
}

let map = {
	create_element,
	create_text,
	create_anchor,
	set_prop,
	insert
};
