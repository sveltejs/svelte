/**
 * @import { TemplateOperations } from "../types.js"
 */
import { escape_html } from '../../../../../escaping.js';
import { is_void } from '../../../../../utils.js';

/**
 * @param {TemplateOperations} items
 */
export function template_to_string(items) {
	/**
	 * @type {Array<Element>}
	 */
	let elements = [];

	/**
	 * @type {Array<Element>}
	 */
	let elements_stack = [];

	/**
	 * @type {Element | undefined}
	 */
	let last_current_element;

	/**
	 * @template {Node} T
	 * @param {T} child
	 */
	function insert(child) {
		if (last_current_element) {
			last_current_element.children ??= [];
			last_current_element.children.push(child);
		} else {
			elements.push(/** @type {Element} */ (child));
		}
		return child;
	}

	for (let instruction of items) {
		switch (instruction.kind) {
			case 'push_element':
				elements_stack.push(/** @type {Element} */ (last_current_element));
				break;
			case 'pop_element':
				elements_stack.pop();
				last_current_element = elements_stack.at(-1);
				break;
			case 'create_element':
				last_current_element = insert({
					kind: 'element',
					element: instruction.name
				});
				break;
			case 'create_text':
				insert({
					kind: 'text',
					value: instruction.args[0]
				});
				break;
			case 'create_anchor':
				insert({
					kind: 'anchor',
					data: instruction.data
				});
				break;
			case 'set_prop': {
				const el = /** @type {Element} */ (last_current_element);
				el.props ??= {};
				el.props[instruction.key] = escape_html(instruction.value, true);
				break;
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
 * @param {Node} el
 * @returns
 */
function stringify(el) {
	let str = ``;
	if (el.kind === 'element') {
		// we create the <tagname part
		str += `<${el.element}`;
		// we concatenate all the prop to it
		for (let [prop, value] of Object.entries(el.props ?? {})) {
			if (value == null) {
				str += ` ${prop}`;
			} else {
				str += ` ${prop}="${value}"`;
			}
		}
		// then we close the opening tag
		str += `>`;
		// we stringify all the children and concatenate them
		for (let child of el.children ?? []) {
			str += stringify(child);
		}
		// if it's not void we also add the closing tag
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
