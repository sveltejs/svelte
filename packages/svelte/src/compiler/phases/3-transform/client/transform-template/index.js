/**
 * @import { ComponentContext, TemplateOperations, ComponentClientTransformState } from "../types.js"
 * @import { Identifier, Expression } from "estree"
 * @import { AST, Namespace } from '#compiler'
 * @import { SourceLocation } from '#shared'
 */
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
	const contains_script_tag = state.metadata.context.template_contains_script_tag;
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
	).concat(state.is_functional_template_mode ? '_fn' : '');
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
 * @param {ComponentContext} context
 * @param {Namespace} namespace
 * @param {Identifier} template_name
 * @param {number} [flags]
 */
export function transform_template(state, context, namespace, template_name, flags) {
	/**
	 * @param {Identifier} template_name
	 * @param {Expression[]} args
	 */
	const add_template = (template_name, args) => {
		let call = b.call(get_template_function(namespace, state), ...args);
		if (dev) {
			call = b.call(
				'$.add_locations',
				call,
				b.member(b.id(context.state.analysis.name), '$.FILENAME', true),
				build_locations(state.locations)
			);
		}

		context.state.hoisted.push(b.var(template_name, call));
	};

	/** @type {Expression[]} */
	const args = [
		state.is_functional_template_mode
			? template_to_functions(state.template)
			: b.template([b.quasi(template_to_string(state.template), true)], [])
	];

	if (flags) {
		args.push(b.literal(flags));
	}

	add_template(template_name, args);
}
