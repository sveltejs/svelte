/**
 * @import { TemplateOperations } from "../types.js"
 * @import { Namespace } from "#compiler"
 * @import { CallExpression, Statement } from "estree"
 */
import { NAMESPACE_SVG, NAMESPACE_MATHML } from '../../../../../constants.js';
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
			const removed = elements_stack.pop();
			if (removed?.namespaced) {
				namespace_stack.pop();
			}
			if (removed?.element === 'foreignObject') {
				foreign_object_count--;
			}
			continue;
		}

		// if the inserted node is in the svg/mathml we push the namespace to the stack because we need to
		// create with createElementNS
		if (instruction.metadata?.svg || instruction.metadata?.mathml) {
			namespace_stack.push(instruction.metadata.svg ? NAMESPACE_SVG : NAMESPACE_MATHML);
		}

		// @ts-expect-error we can't be here if `swap_current_element` but TS doesn't know that
		const value = map[instruction.kind](
			...[
				// for set prop we need to send the last element (not the one in the stack since
				// it get's added to the stack only after the push_element instruction)...for all the rest
				// the first prop is a the scope to generate the name of the variable
				...(instruction.kind === 'set_prop' ? [last_current_element] : [scope]),
				// for create element we also need to add the namespace...namespaces in the stack get's precedence over
				// the "global" namespace (and if we are in a foreignObject we default to html)
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
			// this will compose the body of the function
			body.push(value.call);
		}

		// with set_prop we don't need to do anything else, in all other cases we also need to
		// append the element/node/anchor to the current active element or push it in the elements array
		if (instruction.kind !== 'set_prop') {
			if (elements_stack.length >= 1 && value) {
				const { call } = map.insert(/** @type {Element} */ (elements_stack.at(-1)), value);
				body.push(call);
			} else if (value) {
				elements.push(b.id(value.name));
			}
			// keep track of the last created element (it will be pushed to the stack after the props are set)
			if (instruction.kind === 'create_element') {
				last_current_element = /** @type {Element} */ (value);
				if (last_current_element.element === 'foreignObject') {
					foreign_object_count++;
				}
			}
		}
	}
	// every function needs to return a fragment so we create one and push all the elements there
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
	 * if there's an "is" attribute we can't just add it as a property, it needs to be
	 * specified on creation like this `document.createElement('button', { is: 'my-button' })`
	 *
	 * Since the props are appended after the creation we change the generated call arguments and we push
	 * the is attribute later on on `set_prop`
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
	// see comment above about the "is" attribute
	if (prop === 'is') {
		el.add_is(value);
		return;
	}

	const [namespace] = prop.split(':');
	let fn = namespace !== prop ? '.setAttributeNS' : '.setAttribute';
	let args = [b.literal(fix_attribute_casing(prop)), b.literal(value ?? '')];

	// attributes like `xlink:href` need to be set with the `xlink` namespace
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
			// if we have a template element we need to push into it's content rather than the element itself
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
