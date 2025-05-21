/** @import { Node } from './types.js' */
import { escape_html } from '../../../../../escaping.js';
import { is_void } from '../../../../../utils.js';

/**
 * @param {Node[]} items
 */
export function template_to_string(items) {
	return items.map((el) => stringify(el)).join('');
}

/**
 *
 * @param {Node} el
 * @returns
 */
function stringify(el) {
	let str = ``;
	if (el.type === 'element') {
		// we create the <tagname part
		str += `<${el.name}`;
		// we concatenate all the prop to it
		for (let [prop, value] of Object.entries(el.attributes ?? {})) {
			if (value == null) {
				str += ` ${prop}`;
			} else {
				str += ` ${prop}="${escape_html(value, true)}"`;
			}
		}
		// then we close the opening tag
		str += `>`;
		// we stringify all the children and concatenate them
		for (let child of el.children ?? []) {
			str += stringify(child);
		}
		// if it's not void we also add the closing tag
		if (!is_void(el.name)) {
			str += `</${el.name}>`;
		}
	} else if (el.type === 'text') {
		str += el.nodes.map((node) => node.raw).join('');
	} else if (el.type === 'anchor') {
		if (el.data) {
			str += `<!--${el.data}-->`;
		} else {
			str += `<!>`;
		}
	}

	return str;
}
