/** @import { MemberExpression, Node } from 'estree' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';
import { object } from '../../../utils/ast.js';
import { is_pure, is_safe_identifier } from './shared/utils.js';

/**
 * @param {MemberExpression} node
 * @param {Context} context
 */
export function MemberExpression(node, context) {
	if (node.object.type === 'Identifier' && node.property.type === 'Identifier') {
		const binding = context.state.scope.get(node.object.name);
		if (binding?.kind === 'rest_prop' && node.property.name.startsWith('$$')) {
			e.props_illegal_name(node.property);
		}
	}

	if (context.state.expression && !is_pure(node, context)) {
		context.state.expression.has_state = true;
	}

	if (!is_safe_identifier(node, context.state.scope)) {
		context.state.analysis.needs_context = true;
	}

	if (context.state.reactive_statement) {
		const left = object(node);

		if (left !== null) {
			const binding = context.state.scope.get(left.name);

			if (binding && binding.kind === 'normal') {
				const parent = /** @type {Node} */ (context.path.at(-1));

				if (
					binding.scope === context.state.analysis.module.scope ||
					binding.declaration_kind === 'import' ||
					(binding.initial &&
						binding.initial.type !== 'ArrayExpression' &&
						binding.initial.type !== 'ObjectExpression')
				) {
					if (parent.type !== 'MemberExpression' && parent.type !== 'CallExpression') {
						w.reactive_declaration_non_reactive_property(node);
					}
				}
			}
		}
	}

	context.next();
}
