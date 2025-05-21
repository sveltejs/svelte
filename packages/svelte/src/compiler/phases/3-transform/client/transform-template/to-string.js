/** @import { Node } from './types.js' */
import { escape_html } from '../../../../../escaping.js';
import { is_void } from '../../../../../utils.js';
import * as b from '../../../../utils/builders.js';

/**
 * @param {Node[]} items
 */
export function template_to_string(items) {
	return b.template([b.quasi(items.map(stringify).join(''), true)], []);
}

/**
 * @param {Node} node
 */
function stringify(node) {
	switch (node.type) {
		case 'element': {
			let str = `<${node.name}`;

			for (const key in node.attributes) {
				const value = node.attributes[key];

				str += ` ${key}`;
				if (value !== undefined) str += `="${escape_html(value, true)}"`;
			}

			str += `>`;
			str += node.children.map(stringify).join('');

			if (!is_void(node.name)) {
				str += `</${node.name}>`;
			}

			return str;
		}

		case 'text': {
			return node.nodes.map((node) => node.raw).join('');
		}

		case 'anchor': {
			return node.data ? `<!--${node.data}-->` : '<!>';
		}
	}
}
