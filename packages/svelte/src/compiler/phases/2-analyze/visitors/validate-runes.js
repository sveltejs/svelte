import { error } from '../../../errors.js';
import { get_rune } from '../../scope.js';
import { validate_assignment, validate_call_expression, validate_export } from '../utils.js';
import { validate_module } from './validate-module.js';

/**
 * Validation that applies to components in runes mode
 * @type {import('../types').Visitors}
 */
export const validate_runes = {
	AssignmentExpression(node, { state, path }) {
		const parent = path.at(-1);
		if (parent && parent.type === 'ConstTag') return;
		validate_assignment(node, node.left, state);
	},
	UpdateExpression(node, { state }) {
		validate_assignment(node, node.argument, state);
	},
	LabeledStatement(node, { path }) {
		if (node.label.name !== '$' || path.at(-1)?.type !== 'Program') return;
		error(node, 'invalid-legacy-reactive-statement');
	},
	ExportNamedDeclaration(node, { state }) {
		if (node.declaration?.type !== 'VariableDeclaration') return;
		if (node.declaration.kind !== 'let') return;
		if (state.analysis.instance.scope !== state.scope) return;
		error(node, 'invalid-legacy-export');
	},
	ExportSpecifier(node, { state }) {
		validate_export(node, state.scope, node.local.name);
	},
	CallExpression(node, { state, path }) {
		validate_call_expression(node, state.scope, path);
	},
	EachBlock(node, { next, state }) {
		const context = node.context;
		if (
			context.type === 'Identifier' &&
			(context.name === '$state' || context.name === '$derived')
		) {
			error(
				node,
				context.name === '$derived' ? 'invalid-derived-location' : 'invalid-state-location'
			);
		}
		next({ ...state });
	},
	VariableDeclarator(node, { state }) {
		const init = node.init;
		const rune = get_rune(init, state.scope);

		if (rune === null) return;

		const args = /** @type {import('estree').CallExpression} */ (init).arguments;

		if (rune === '$derived' && args.length !== 1) {
			error(node, 'invalid-rune-args-length', '$derived', [1]);
		} else if (rune === '$state' && args.length > 1) {
			error(node, 'invalid-rune-args-length', '$state', [0, 1]);
		} else if (rune === '$props') {
			if (state.has_props_rune) {
				error(node, 'duplicate-props-rune');
			}

			state.has_props_rune = true;

			if (args.length > 0) {
				error(node, 'invalid-rune-args-length', '$props', [0]);
			}

			if (node.id.type !== 'ObjectPattern') {
				error(node, 'invalid-props-id');
			}

			if (state.scope !== state.analysis.instance.scope) {
				error(node, 'invalid-props-location');
			}

			for (const property of node.id.properties) {
				if (property.type === 'Property') {
					if (property.computed) {
						error(property, 'invalid-props-pattern');
					}

					const value =
						property.value.type === 'AssignmentPattern' ? property.value.left : property.value;

					if (value.type !== 'Identifier') {
						error(property, 'invalid-props-pattern');
					}
				}
			}
		}
	},
	// TODO move this
	ClassBody: validate_module.ClassBody
};
