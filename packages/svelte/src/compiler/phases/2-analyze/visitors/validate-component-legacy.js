import { error } from '../../../errors.js';
import { validate_assignment } from '../utils.js';

/**
 * Validation that only applies in non-runes mode
 * @type {import('../types.js').Visitors}
 */
export const validate_component_legacy = {
	VariableDeclarator(node) {
		if (node.init?.type !== 'CallExpression') return;

		const callee = node.init.callee;
		if (
			callee.type !== 'Identifier' ||
			(callee.name !== '$state' && callee.name !== '$derived' && callee.name !== '$props')
		) {
			return;
		}

		// TODO check if it's a store subscription that's called? How likely is it that someone uses a store that contains a function?
		error(node.init, 'invalid-rune-usage', callee.name);
	},
	ExportNamedDeclaration(node) {
		if (
			node.declaration &&
			node.declaration.type !== 'VariableDeclaration' &&
			node.declaration.type !== 'FunctionDeclaration'
		) {
			error(node, 'TODO', 'whatever this is');
		}
	},
	AssignmentExpression(node, { state, path }) {
		// TODO this is also in validation_runes, DRY out
		const parent = path.at(-1);
		if (parent && parent.type === 'ConstTag') return;
		validate_assignment(node, node.left, state);
	},
	UpdateExpression(node, { state }) {
		// TODO this is also in validation_runes, DRY out
		validate_assignment(node, node.argument, state);
	}
};
