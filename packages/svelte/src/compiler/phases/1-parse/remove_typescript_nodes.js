import { walk } from 'zimmerframe';
import * as b from '../../utils/builders.js';

/**
 * @param {import('estree').FunctionExpression | import('estree').FunctionDeclaration} node
 * @param {import('zimmerframe').Context<any, any>} context
 */
function remove_this_param(node, context) {
	if (node.params[0]?.type === 'Identifier' && node.params[0].name === 'this') {
		node.params.shift();
	}
	return context.next();
}

/** @type {import('zimmerframe').Visitors<any, null>} */
const visitors = {
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
	TSSatisfiesExpression(node, context) {
		return context.visit(node.expression);
	},
	TSNonNullExpression(node, context) {
		return context.visit(node.expression);
	},
	TSInterfaceDeclaration() {
		return b.empty;
	},
	TSTypeAliasDeclaration() {
		return b.empty;
	},
	TSTypeParameterDeclaration() {
		return b.empty;
	},
	TSTypeParameterInstantiation() {
		return b.empty;
	},
	TSEnumDeclaration() {
		return b.empty;
	},
	Identifier(node) {
		if (node.typeAnnotation) {
			return {
				...node,
				typeAnnotation: null
			};
		}
		return node;
	},
	FunctionExpression: remove_this_param,
	FunctionDeclaration: remove_this_param
};

/**
 * @template T
 * @param {T} ast
 * @returns {T}
 */
export function remove_typescript_nodes(ast) {
	return walk(ast, null, visitors);
}
