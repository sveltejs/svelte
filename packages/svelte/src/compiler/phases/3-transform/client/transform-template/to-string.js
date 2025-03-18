/**
 * @import { TemplateOperations } from "../types.js"
 */
import { is_void } from '../../../../../utils.js';

/**
 * @param {TemplateOperations} items
 */
export function template_to_string(items) {
	let elements = [];

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
		/**
		 * @type {Node | void}
		 */
		// @ts-expect-error we can't be here if `swap_current_element` but TS doesn't know that
		const value = map[instruction.kind](
			...[
				...(instruction.kind === 'set_prop' ? [last_current_element] : []),
				...(instruction.args ?? [])
			]
		);
		if (instruction.kind !== 'set_prop') {
			if (elements_stack.length >= 1 && value) {
				map.insert(/** @type {Element} */ (elements_stack.at(-1)), value);
			} else if (value) {
				elements.push(value);
			}
			if (instruction.kind === 'create_element') {
				last_current_element = /** @type {Element} */ (value);
			}
		}
	}

	return elements.map((el) => stringify(el)).join('');
}

/**
 * @typedef {{ kind: "element", element: string, props?: Record<string, string>, children?: Array<Node> }} Element
 */

/**
 * @typedef {{ kind: "anchor", data?: string }} Anchor
 */

/**
 * @typedef {{ kind: "text", value?: string }} Text
 */

/**
 * @typedef { Element | Anchor| Text } Node
 */

/**
 *
 * @param {string} element
 * @returns {Element}
 */
function create_element(element) {
	return {
		kind: 'element',
		element
	};
}

/**
 * @param {string} data
 * @returns {Anchor}
 */
function create_anchor(data) {
	return {
		kind: 'anchor',
		data
	};
}

/**
 * @param {string} value
 * @returns {Text}
 */
function create_text(value) {
	return {
		kind: 'text',
		value
	};
}

/**
 *
 * @param {Element} el
 * @param {string} prop
 * @param {string} value
 */
function set_prop(el, prop, value) {
	el.props ??= {};
	el.props[prop] = value;
}

/**
 *
 * @param {Element} el
 * @param {Node} child
 * @param {Node} [anchor]
 */
function insert(el, child, anchor) {
	el.children ??= [];
	el.children.push(child);
}

let map = {
	create_element,
	create_text,
	create_anchor,
	set_prop,
	insert
};

/**
 *
 * @param {Node} el
 * @returns
 */
function stringify(el) {
	let str = ``;
	if (el.kind === 'element') {
		str += `<${el.element}`;
		for (let [prop, value] of Object.entries(el.props ?? {})) {
			if (value == null) {
				str += ` ${prop}`;
			} else {
				str += ` ${prop}="${value}"`;
			}
		}
		str += `>`;
		for (let child of el.children ?? []) {
			str += stringify(child);
		}
		if (!is_void(el.element)) {
			str += `</${el.element}>`;
		}
	} else if (el.kind === 'text') {
		str += el.value;
	} else if (el.kind === 'anchor') {
		if (el.data) {
			str += `<!--${el.data}-->`;
		} else {
			str += `<!>`;
		}
	}

	return str;
}
