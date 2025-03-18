/**
 * @import { TemplateOperations } from "../types.js"
 * @import { Namespace } from "#compiler"
 * @import { Statement } from "estree"
 */
import { NAMESPACE_SVG } from 'svelte/internal/client';
import * as b from '../../../../utils/builders.js';
import { NAMESPACE_MATHML } from '../../../../../constants.js';

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
 * @param {boolean} use_fragment
 */
export function template_to_functions(items, namespace, use_fragment = false) {
	let elements = [];

	let body = [];

	let scope = new Scope();

	/**
	 * @type {Array<Element>}
	 */
	let elements_stack = [];

	/**
	 * @type {Element | undefined}
	 */
	let last_current_element;

	for (let instruction of items) {
		if (instruction.kind === 'push_element' && last_current_element) {
			elements_stack.push(last_current_element);
			continue;
		}
		if (instruction.kind === 'pop_element') {
			elements_stack.pop();
			continue;
		}

		// @ts-expect-error we can't be here if `swap_current_element` but TS doesn't know that
		const value = map[instruction.kind](
			...[
				...(instruction.kind === 'set_prop' ? [last_current_element] : [scope]),
				...(instruction.kind === 'create_element' ? [namespace] : []),
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
			}
		}
	}
	if (elements.length > 1 || use_fragment) {
		const fragment = scope.generate('fragment');
		body.push(b.var(fragment, b.call('document.createDocumentFragment')));
		body.push(b.call(fragment + '.append', ...elements));
		body.push(b.return(b.id(fragment)));
	} else {
		body.push(b.return(elements[0]));
	}

	return b.arrow([], b.block(body));
}

/**
 * @typedef {{ call: Statement, name: string }} Element
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
	let fn = namespace !== 'html' ? 'document.createElementNS' : 'document.createElement';
	let args = [b.literal(element)];
	if (namespace !== 'html') {
		args.unshift(namespace === 'svg' ? b.literal(NAMESPACE_SVG) : b.literal(NAMESPACE_MATHML));
	}
	return {
		call: b.var(name, b.call(fn, ...args)),
		name
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
	return {
		call: b.call(el.name + '.setAttribute', b.literal(prop), b.literal(value))
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
		call: b.call(el.name + '.insertBefore', b.id(child.name), b.id(anchor?.name ?? 'undefined'))
	};
}

let map = {
	create_element,
	create_text,
	create_anchor,
	set_prop,
	insert
};
