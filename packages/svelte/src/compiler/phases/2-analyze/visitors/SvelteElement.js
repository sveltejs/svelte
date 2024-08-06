/** @import { Attribute, SvelteElement, Text } from '#compiler' */
/** @import { Context } from '../types' */
import { NAMESPACE_MATHML, NAMESPACE_SVG } from '../../../../constants.js';
import { is_text_attribute } from '../../../utils/ast.js';
import { check_element } from './shared/a11y.js';
import { validate_element } from './shared/element.js';

/**
 * @param {SvelteElement} node
 * @param {Context} context
 */
export function SvelteElement(node, context) {
	validate_element(node, context);

	check_element(node, context.state);

	context.state.analysis.elements.push(node);

	const xmlns = /** @type {Attribute & { value: [Text] } | undefined} */ (
		node.attributes.find(
			(a) => a.type === 'Attribute' && a.name === 'xmlns' && is_text_attribute(a)
		)
	);

	if (xmlns) {
		node.metadata.svg = xmlns.value[0].data === NAMESPACE_SVG;
		node.metadata.mathml = xmlns.value[0].data === NAMESPACE_MATHML;
	} else {
		let i = context.path.length;
		while (i--) {
			const ancestor = context.path[i];

			if (
				ancestor.type === 'Component' ||
				ancestor.type === 'SvelteComponent' ||
				ancestor.type === 'SvelteFragment' ||
				ancestor.type === 'SnippetBlock'
			) {
				// Inside a slot or a snippet -> this resets the namespace, so assume the component namespace
				node.metadata.svg = context.state.options.namespace === 'svg';
				node.metadata.mathml = context.state.options.namespace === 'mathml';
				break;
			}

			if (ancestor.type === 'SvelteElement' || ancestor.type === 'RegularElement') {
				node.metadata.svg =
					ancestor.type === 'RegularElement' && ancestor.name === 'foreignObject'
						? false
						: ancestor.metadata.svg;

				node.metadata.mathml =
					ancestor.type === 'RegularElement' && ancestor.name === 'foreignObject'
						? false
						: ancestor.metadata.mathml;

				break;
			}
		}
	}

	context.next({ ...context.state, parent_element: null });
}
