import { error } from '../../../errors.js';
import { extract_identifiers } from '../../../utils/ast.js';
import { get_rune } from '../../scope.js';
import { validate_assignment, validate_call_expression, validate_export } from '../utils.js';

/**
 * Validation that applies to .svelte.js files (TODO and <script context="module">?)
 * @type {import('../types.js').Visitors}
 */
export const validate_module = {
	ExportSpecifier(node, { state }) {
		validate_export(node, state.scope, node.local.name);
	},
	ExportNamedDeclaration(node, { state, next }) {
		if (node.declaration?.type !== 'VariableDeclaration') return;

		// visit children, so bindings are correctly initialised
		next();

		for (const declarator of node.declaration.declarations) {
			for (const id of extract_identifiers(declarator.id)) {
				validate_export(node, state.scope, id.name);
			}
		}
	},
	CallExpression(node, { state, path }) {
		validate_call_expression(node, state.scope, path);
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
			error(node, 'invalid-props-location');
		}
	},
	AssignmentExpression(node, { state }) {
		validate_assignment(node, node.left, state);
	},
	UpdateExpression(node, { state }) {
		validate_assignment(node, node.argument, state);
	},
	ClassBody(node, context) {
		/** @type {string[]} */
		const private_derived_state = [];

		for (const definition of node.body) {
			if (
				definition.type === 'PropertyDefinition' &&
				definition.key.type === 'PrivateIdentifier' &&
				definition.value?.type === 'CallExpression'
			) {
				const rune = get_rune(definition.value, context.state.scope);
				if (rune === '$derived') {
					private_derived_state.push(definition.key.name);
				}
			}
		}

		context.next({
			...context.state,
			private_derived_state
		});
	}
};
