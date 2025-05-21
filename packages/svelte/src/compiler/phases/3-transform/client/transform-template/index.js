/** @import { ComponentContext, ComponentClientTransformState } from '../types.js' */
/** @import { Identifier, Expression } from 'estree' */
/** @import { Namespace } from '#compiler' */
/** @import { SourceLocation } from '#shared' */
import { dev } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';
import { template_to_functions } from './to-functions.js';
import { template_to_string } from './to-string.js';

/**
 *
 * @param {Namespace} namespace
 * @param {ComponentClientTransformState} state
 * @returns
 */
function get_template_function(namespace, state) {
	const contains_script_tag = state.template.contains_script_tag;
	return (
		namespace === 'svg'
			? contains_script_tag
				? '$.svg_template_with_script'
				: '$.ns_template'
			: namespace === 'mathml'
				? '$.mathml_template'
				: contains_script_tag
					? '$.template_with_script'
					: '$.template'
	).concat(state.options.templatingMode === 'functional' ? '_fn' : '');
}

/**
 * @param {SourceLocation[]} locations
 */
function build_locations(locations) {
	return b.array(
		locations.map((loc) => {
			const expression = b.array([b.literal(loc[0]), b.literal(loc[1])]);

			if (loc.length === 3) {
				expression.elements.push(build_locations(loc[2]));
			}

			return expression;
		})
	);
}

/**
 * @param {ComponentClientTransformState} state
 * @param {Namespace} namespace
 * @param {Identifier} template_name
 * @param {number} [flags]
 */
export function transform_template(state, namespace, template_name, flags) {
	const expression =
		state.options.templatingMode === 'functional'
			? template_to_functions(state.template.nodes)
			: template_to_string(state.template.nodes);

	let call = b.call(
		get_template_function(namespace, state),
		expression,
		flags ? b.literal(flags) : undefined
	);

	if (dev) {
		call = b.call(
			'$.add_locations',
			call,
			b.member(b.id(state.analysis.name), '$.FILENAME', true),
			build_locations(state.locations)
		);
	}

	state.hoisted.push(b.var(template_name, call));
}
