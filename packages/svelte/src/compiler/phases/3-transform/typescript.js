import * as b from '../../utils/builders.js';

/** @type {import('zimmerframe').Visitors<any, any>} */
export const remove_types = {
	ImportDeclaration(node) {
		if (node.importKind === 'type') return b.empty;

		const specifiers = node.specifiers.filter((s) => s.importKind === 'value');
		if (specifiers.length === 0) return b.empty;

		return { ...node, specifiers };
	},
	ExportNamedDeclaration(node, context) {
		if (node.importKind === 'type') return b.empty;

		const specifiers = node.specifiers.filter((s) => s.importKind === 'value');
		if (specifiers.length === 0) return b.empty;

		return { ...node, specifiers };
	},
	TSAsExpression(node, context) {
		return context.visit(node.expression);
	},
	TSNonNullExpression(node, context) {
		return context.visit(node.expression);
	},
	TSInterfaceDeclaration(node, context) {
		return b.empty;
	},
	TSTypeAliasDeclaration(node, context) {
		return b.empty;
	}
};
