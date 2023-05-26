import is_reference from 'is-reference';

/**
 *
 * @param {import('estree').Node} node
 * @param {import('estree').Node} parent
 * @returns {boolean}
 */
export default function is_used_as_reference(node, parent) {
	if (
		!is_reference(
			/** @type {import('is-reference').NodeWithPropertyDefinition} */ (node),
			/** @type {import('is-reference').NodeWithPropertyDefinition} */ (parent)
		)
	) {
		return false;
	}
	if (!parent) {
		return true;
	}

	/* eslint-disable no-fallthrough */
	switch (parent.type) {
		// disregard the `foo` in `const foo = bar`
		case 'VariableDeclarator':
			return node !== parent.id;
		// disregard the `foo`, `bar` in `function foo(bar){}`
		case 'FunctionDeclaration':
		// disregard the `foo` in `import { foo } from 'foo'`
		case 'ImportSpecifier':
		// disregard the `foo` in `import foo from 'foo'`
		case 'ImportDefaultSpecifier':
		// disregard the `foo` in `import * as foo from 'foo'`
		case 'ImportNamespaceSpecifier':
		// disregard the `foo` in `export { foo }`
		case 'ExportSpecifier':
			return false;
		default:
			return true;
	}
}
