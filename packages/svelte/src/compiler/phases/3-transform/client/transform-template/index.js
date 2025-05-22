/** @import { Location } from 'locate-character' */
/** @import { Namespace } from '#compiler' */
/** @import { ComponentClientTransformState } from '../types.js' */
/** @import { Node } from './types.js' */
import { dev, locator } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';

/**
 *
 * @param {Namespace} namespace
 * @param {ComponentClientTransformState} state
 * @returns
 */
function get_template_function(namespace, state) {
	return (
		namespace === 'svg'
			? '$.ns_template'
			: namespace === 'mathml'
				? '$.mathml_template'
				: '$.template'
	).concat(state.options.templatingMode === 'functional' ? '_fn' : '');
}

/**
 * @param {Node[]} nodes
 */
function build_locations(nodes) {
	const array = b.array([]);

	for (const node of nodes) {
		if (node.type !== 'element') continue;

		const { line, column } = /** @type {Location} */ (locator(node.start));

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
export function transform_template(state, namespace, flags) {
	const expression =
		state.options.templatingMode === 'functional'
			? state.template.as_objects()
			: state.template.as_string();

	let call = b.call(
		get_template_function(namespace, state),
		expression,
		flags ? b.literal(flags) : undefined
	);

	if (state.template.contains_script_tag) {
		call = b.call(`$.with_script`, call);
	}

	if (dev) {
		return b.call(
			'$.add_locations',
			call,
			b.member(b.id(state.analysis.name), '$.FILENAME', true),
			build_locations(state.template.nodes)
		);
	}

	return call;
}
