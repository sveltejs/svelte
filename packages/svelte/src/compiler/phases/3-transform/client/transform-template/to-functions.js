/**
 * @import { TemplateOperations } from "../types.js"
 * @import { Namespace } from "#compiler"
 * @import { CallExpression, Statement } from "estree"
 */
import { NAMESPACE_SVG } from 'svelte/internal/client';
import { NAMESPACE_MATHML } from '../../../../../constants.js';
import * as b from '../../../../utils/builders.js';
import fix_attribute_casing from './fix-attribute-casing.js';

class Scope {
	declared = new Map();

	/**
	 * @param {string} _name
	 */
	generate(_name) {
		let name = _name.replace(/[^a-zA-Z0-9_$]/g, '_').replace(/^[0-9]/, '_');
		if (!this.declared.has(name)) {
			this.declared.set(name, 1);
			return name;
		}
		let count = this.declared.get(name);
		this.declared.set(name, count + 1);
		return `${name}_${count}`;
	}
}

/**
 * @param {TemplateOperations} items
 * @param {Namespace} namespace
 */
export function template_to_functions(items, namespace) {
	let elements = [];

	let body = [];

	let scope = new Scope();

	/**
	 * @type {Array<Element>}
	 */
	let elements_stack = [];

	/**
	 * @type {Array<string>}
	 */
	let namespace_stack = [];

	/**
	 * @type {number}
	 */
	let foreign_object_count = 0;

	/**
	 * @type {Element | undefined}
	 */
	let last_current_element;

	if (items[0].kind === 'create_anchor') {
		items.unshift({ kind: 'create_anchor' });
	}

	for (let instruction of items) {
		if (instruction.kind === 'push_element' && last_current_element) {
			elements_stack.push(last_current_element);
			continue;
		}
		if (instruction.kind === 'pop_element') {
			const removed = elements_stack.pop();
			if (removed?.namespaced) {
				namespace_stack.pop();
			}
			if (removed?.element === 'foreignObject') {
				foreign_object_count--;
			}
			continue;
		}

		if (instruction.metadata?.svg || instruction.metadata?.mathml) {
			namespace_stack.push(instruction.metadata.svg ? NAMESPACE_SVG : NAMESPACE_MATHML);
		}

		// @ts-expect-error we can't be here if `swap_current_element` but TS doesn't know that
		const value = map[instruction.kind](
			...[
				...(instruction.kind === 'set_prop' ? [last_current_element] : [scope]),
				...(instruction.kind === 'create_element'
					? [
							foreign_object_count > 0
								? undefined
								: namespace_stack.at(-1) ??
									(namespace === 'svg'
										? NAMESPACE_SVG
										: namespace === 'mathml'
											? NAMESPACE_MATHML
											: undefined)
						]
					: []),
				...(instruction.args ?? [])
			]
		);

		if (value) {
			body.push(value.call);
		}

		if (instruction.kind !== 'set_prop') {
			if (elements_stack.length >= 1 && value) {
				const { call } = map.insert(/** @type {Element} */ (elements_stack.at(-1)), value);
				body.push(call);
			} else if (value) {
				elements.push(b.id(value.name));
			}
			if (instruction.kind === 'create_element') {
				last_current_element = /** @type {Element} */ (value);
				if (last_current_element.element === 'foreignObject') {
					foreign_object_count++;
				}
			}
		}
	}
	const fragment = scope.generate('fragment');
	body.push(b.var(fragment, b.call('document.createDocumentFragment')));
	body.push(b.call(fragment + '.append', ...elements));
	body.push(b.return(b.id(fragment)));

	return b.arrow([], b.block(body));
}

/**
 * @typedef {{ call: Statement, name: string, add_is: (value: string)=>void, namespaced: boolean; element: string; }} Element
 */

/**
 * @typedef {{ call: Statement, name: string }} Anchor
 */

/**
 * @typedef {{ call: Statement, name: string }} Text
 */

/**
 * @typedef { Element | Anchor| Text } Node
 */

/**
 * @param {Scope} scope
 * @param {Namespace} namespace
 * @param {string} element
 * @returns {Element}
 */
function create_element(scope, namespace, element) {
	const name = scope.generate(element);
	let fn = namespace != null ? 'document.createElementNS' : 'document.createElement';
	let args = [b.literal(element)];
	if (namespace != null) {
		args.unshift(b.literal(namespace));
	}
	const call = b.var(name, b.call(fn, ...args));
	/**
	 * @param {string} value
	 */
	function add_is(value) {
		/** @type {CallExpression} */ (call.declarations[0].init).arguments.push(
			b.object([b.prop('init', b.literal('is'), b.literal(value))])
		);
	}
	return {
		call,
		name,
		element,
		add_is,
		namespaced: namespace != null
	};
}

/**
 * @param {Scope} scope
 * @param {string} data
 * @returns {Anchor}
 */
function create_anchor(scope, data = '') {
	const name = scope.generate('comment');
	return {
		call: b.var(name, b.call('document.createComment', b.literal(data))),
		name
	};
}

/**
 * @param {Scope} scope
 * @param {string} value
 * @returns {Text}
 */
function create_text(scope, value) {
	const name = scope.generate('text');
	return {
		call: b.var(name, b.call('document.createTextNode', b.literal(value))),
		name
	};
}

/**
 *
 * @param {Element} el
 * @param {string} prop
 * @param {string} value
 */
function set_prop(el, prop, value) {
	if (prop === 'is') {
		el.add_is(value);
		return;
	}

	const [namespace] = prop.split(':');
	let fn = namespace !== prop ? '.setAttributeNS' : '.setAttribute';
	let args = [b.literal(fix_attribute_casing(prop)), b.literal(value ?? '')];

	if (namespace === 'xlink') {
		args.unshift(b.literal('http://www.w3.org/1999/xlink'));
	}

	return {
		call: b.call(el.name + fn, ...args)
	};
}

/**
 *
 * @param {Element} el
 * @param {Node} child
 * @param {Node} [anchor]
 */
function insert(el, child, anchor) {
	return {
		call: b.call(
			el.name + (el.element === 'template' ? '.content' : '') + '.insertBefore',
			b.id(child.name),
			b.id(anchor?.name ?? 'undefined')
		)
	};
}

let map = {
	create_element,
	create_text,
	create_anchor,
	set_prop,
	insert
};
