import { Node } from 'estree';
import is_reference from 'is-reference';

export default function is_used_as_reference(
	node: Node,
	parent: Node
): boolean {
	if (!is_reference(node, parent)) {
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
