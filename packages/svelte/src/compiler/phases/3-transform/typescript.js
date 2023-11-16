import * as b from '../../utils/builders.js';

/** @type {import('zimmerframe').Visitors<any, any>} */
export const remove_types = {
	ImportDeclaration(node) {
		if (node.importKind === 'type') return b.empty;

		if (node.specifiers?.length > 0) {
			const specifiers = node.specifiers.filter((/** @type {any} */ s) => s.importKind !== 'type');
			if (specifiers.length === 0) return b.empty;

			return { ...node, specifiers };
		}

		return node;
	},
	ExportNamedDeclaration(node, context) {
		if (node.exportKind === 'type') return b.empty;

		if (node.declaration) {
			return context.next();
		}

		if (node.specifiers) {
			const specifiers = node.specifiers.filter((/** @type {any} */ s) => s.exportKind !== 'type');
			if (specifiers.length === 0) return b.empty;

			return { ...node, specifiers };
		}

		return node;
	},
	ExportDefaultDeclaration(node) {
		if (node.exportKind === 'type') return b.empty;
		return node;
	},
	ExportAllDeclaration(node) {
		if (node.exportKind === 'type') return b.empty;
		return node;
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
