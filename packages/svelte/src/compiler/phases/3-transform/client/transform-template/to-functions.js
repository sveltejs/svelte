/** @import { Node } from './types.js' */
import * as b from '../../../../utils/builders.js';
import { regex_starts_with_newline } from '../../../patterns.js';
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

			const attributes = b.prop('init', b.id('p'), b.object([]));

			for (const key in item.attributes) {
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

				// special case — strip leading newline from `<pre>` and `<textarea>`
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
