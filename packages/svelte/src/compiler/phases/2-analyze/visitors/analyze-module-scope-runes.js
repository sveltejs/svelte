import { extract_paths } from '../../../utils/ast.js';
import { get_rune } from '../../scope.js';

/** @type {import('zimmerframe').Visitors<import('#compiler').SvelteNode, { scope: import('../../scope.js').Scope }>} */
export const analyze_module_scope_runes = {
	VariableDeclarator(node, { state }) {
		if (node.init?.type !== 'CallExpression') return;
		if (get_rune(node.init, state.scope) === null) return;

		const callee = node.init.callee;
		if (callee.type !== 'Identifier') return;

		const name = callee.name;
		if (name !== '$state' && name !== '$derived') return;

		for (const path of extract_paths(node.id)) {
			// @ts-ignore this fails in CI for some insane reason
			const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(path.node.name));
			binding.kind = name === '$state' ? 'state' : 'derived';
		}
	}
};
