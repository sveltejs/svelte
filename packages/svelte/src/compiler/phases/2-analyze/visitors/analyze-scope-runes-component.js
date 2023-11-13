import { extract_identifiers, extract_paths } from '../../../utils/ast.js';
import { get_rune } from '../../scope.js';

/** @type {import('../types').Visitors} */
export const analyze_scope_runes_component = {
	VariableDeclarator(node, { state }) {
		if (node.init?.type !== 'CallExpression') return;
		if (get_rune(node.init, state.scope) === null) return;

		const callee = node.init.callee;
		if (callee.type !== 'Identifier') return;

		const name = callee.name;
		if (name !== '$state' && name !== '$derived' && name !== '$props') return;

		for (const path of extract_paths(node.id)) {
			// @ts-ignore this fails in CI for some insane reason
			const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(path.node.name));
			binding.kind =
				name === '$state'
					? 'state'
					: name === '$derived'
					? 'derived'
					: path.is_rest
					? 'rest_prop'
					: 'prop';
		}

		if (name === '$props') {
			for (const property of /** @type {import('estree').ObjectPattern} */ (node.id).properties) {
				if (property.type !== 'Property') continue;

				const name =
					property.value.type === 'AssignmentPattern'
						? /** @type {import('estree').Identifier} */ (property.value.left).name
						: /** @type {import('estree').Identifier} */ (property.value).name;
				const alias =
					property.key.type === 'Identifier'
						? property.key.name
						: /** @type {string} */ (/** @type {import('estree').Literal} */ (property.key).value);
				const initial = property.value.type === 'AssignmentPattern' ? property.value.right : null;

				const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(name));
				binding.prop_alias = alias;
				binding.initial = initial; // rewire initial from $props() to the actual initial value
			}
		}
	},
	ExportSpecifier(node, { state }) {
		state.analysis.exports.push({
			name: node.local.name,
			alias: node.exported.name
		});
	},
	ExportNamedDeclaration(node, { next, state }) {
		if (!node.declaration) {
			return next();
		}

		if (node.declaration.type === 'FunctionDeclaration') {
			state.analysis.exports.push({
				name: /** @type {import('estree').Identifier} */ (node.declaration.id).name,
				alias: null
			});
			return next();
		}

		if (node.declaration.type === 'VariableDeclaration' && node.declaration.kind === 'const') {
			for (const declarator of node.declaration.declarations) {
				for (const node of extract_identifiers(declarator.id)) {
					state.analysis.exports.push({ name: node.name, alias: null });
				}
			}
		}
	}
};
