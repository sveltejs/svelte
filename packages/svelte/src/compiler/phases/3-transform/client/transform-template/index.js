/** @import { Namespace } from '#compiler' */
/** @import { ComponentClientTransformState } from '../types.js' */
/** @import { Node } from './types.js' */
import { TEMPLATE_USE_MATHML, TEMPLATE_USE_SVG } from '../../../../../constants.js';
import { dev, locator } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';

/**
 * @param {Node[]} nodes
 */
function build_locations(nodes) {
	const array = b.array([]);

	for (const node of nodes) {
		if (node.type !== 'element') continue;

		const { line, column } = locator(node.start);

		const expression = b.array([b.literal(line), b.literal(column)]);
		const children = build_locations(node.children);

		if (children.elements.length > 0) {
			expression.elements.push(children);
		}

		array.elements.push(expression);
	}

	return array;
}

/**
 * @param {ComponentClientTransformState} state
 * @param {Namespace} namespace
 * @param {number} [flags]
 */
export function transform_template(state, namespace, flags = 0) {
	const tree = state.options.fragments === 'tree';

	const expression = tree ? state.template.as_tree() : state.template.as_html();

	if (tree) {
		if (namespace === 'svg') flags |= TEMPLATE_USE_SVG;
		if (namespace === 'mathml') flags |= TEMPLATE_USE_MATHML;
	}

	let call = b.call(
		tree ? `$.from_tree` : `$.from_${namespace}`,
		expression,
		flags ? b.literal(flags) : undefined
	);

	if (state.template.contains_script_tag) {
		call = b.call(`$.with_script`, call);
	}

	if (dev) {
		call = b.call(
			'$.add_locations',
			call,
			b.member(b.id(state.analysis.name), '$.FILENAME', true),
			build_locations(state.template.nodes)
		);
	}

	return call;
}
