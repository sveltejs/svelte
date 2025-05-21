/** @import { Node } from './types.js' */
/** @import { ObjectExpression, Identifier, ArrayExpression, Property, Expression, Literal } from 'estree' */
import * as b from '../../../../utils/builders.js';
import { regex_is_valid_identifier, regex_starts_with_newline } from '../../../patterns.js';
import fix_attribute_casing from './fix-attribute-casing.js';

/**
 * @param {Node[]} items
 */
export function template_to_functions(items) {
	// if the first item is a comment we need to add another comment for effect.start
	if (items[0].type === 'anchor') {
		items.unshift({ type: 'anchor', data: undefined });
	}

	return b.array(items.map(build));
}

/** @param {Node} item */
function build(item) {
	switch (item.type) {
		case 'element': {
			const element = b.object([b.prop('init', b.id('e'), b.literal(item.name))]);

			if (item.attributes.is) {
				element.properties.push(b.prop('init', b.id('is'), b.literal(item.attributes.is)));
			}

			const attributes = b.prop('init', b.id('p'), b.object([]));

			for (const key in item.attributes) {
				if (key === 'is') continue;

				const value = item.attributes[key];

				attributes.value.properties.push(
					b.prop(
						'init',
						b.key(fix_attribute_casing(key)),
						value === undefined ? b.void0 : b.literal(value)
					)
				);
			}

			if (attributes.value.properties.length > 0) {
				element.properties.push(attributes);
			}

			if (item.children.length > 0) {
				const children = item.children.map(build);
				element.properties.push(b.prop('init', b.id('c'), b.array(children)));

				// special case — strip leading newline from `<pre>` and `<textarea>`
				if (item.name === 'pre' || item.name === 'textarea') {
					const first = children[0];
					if (first?.type === 'Literal') {
						first.value = /** @type {string} */ (first.value).replace(
							regex_starts_with_newline,
							''
						);
					}
				}
			}

			return element;
		}

		case 'anchor': {
			return item.data ? b.array([b.literal(item.data)]) : null;
		}

		case 'text': {
			return b.literal(item.nodes.map((node) => node.data).join(''));
		}
	}
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

	// TODO this is temporary, but i want the tests to keep passing in the meantime
	// @ts-expect-error
	const name = element?.properties[0].value.value;

	if ((name === 'pre' || name === 'textarea') && regex_starts_with_newline.test(value)) {
		// @ts-expect-error
		if (!element.properties.find((prop) => prop.key.name === 'c')) {
			value = value.replace(regex_starts_with_newline, '');
		}
	}

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
