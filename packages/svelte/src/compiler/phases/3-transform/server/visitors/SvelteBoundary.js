/** @import { BlockStatement, Statement, Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { extract_identifiers } from '../../../../utils/ast.js';

/**
 * @param {AST.SvelteBoundary} node
 * @param {ComponentContext} context
 */
export function SvelteBoundary(node, context) {
	/** @type {Statement[]} */
	const statements = [];

	/** @type {AST.SnippetBlock | null} */
	let snippet = null;

	/** @type {AST.ConstTag[]} */
	let const_tags = [];

	const nodes = [];

	const payload = b.id('$$payload'); // correct ?

	/** @type {Expression | undefined} */
	let failed;

	// Capture the `failed` explicit snippet prop
	for (const attribute of node.attributes) {
		if (attribute.type === 'Attribute' && attribute.name === 'failed' && attribute.value !== true) {
			const chunk = Array.isArray(attribute.value)
				? /** @type {AST.ExpressionTag} */ (attribute.value[0])
				: attribute.value;
			failed = /** @type {Expression} */ (context.visit(chunk.expression, context.state));
		}
	}

	// Capture the `failed` implicit snippet prop
	for (const child of node.fragment.nodes) {
		if (child.type === 'SnippetBlock' && child.expression.name === 'failed') {
			snippet = child;

			/** @type {Statement[]} */
			const init = [];
			context.visit(snippet, { ...context.state, init });

			if (init.length === 1 && init[0].type === 'FunctionDeclaration') {
				failed = b.arrow(init[0].params, init[0].body);
			} else {
				statements.push(...init);
				failed = b.id('failed');
			}
		} else if (child.type === 'ConstTag') {
			const_tags.push(child);
		} else {
			nodes.push(child);
		}
	}

	let max_referenced_const_tag = -1;

	if (snippet) {
		const references = context.state.scopes.get(snippet)?.references;
		if (references != null && references.size) {
			const keys = new Set(references.keys());

			const_tags.forEach((tag, index) => {
				if (has_reference(keys, tag)) {
					max_referenced_const_tag = index + 1;
				}
			});
		}
	}

	if (max_referenced_const_tag < 0) {
		nodes.unshift(...const_tags);
	} else if (max_referenced_const_tag === const_tags.length) {
		const_tags.forEach((tag) => context.visit(tag, { ...context.state, init: statements }));
	} else {
		const_tags
			.slice(0, max_referenced_const_tag)
			.forEach((tag) => context.visit(tag, { ...context.state, init: statements }));
		nodes.unshift(...const_tags.slice(max_referenced_const_tag));
	}

	const body_block = /** @type {BlockStatement} */ (context.visit({ ...node.fragment, nodes }));

	const body = b.arrow([b.id('$$payload')], body_block);

	statements.push(b.stmt(b.call('$.boundary', payload, body, failed)));

	if (statements.length === 1) {
		context.state.template.push(statements[0]);
	} else {
		context.state.template.push(b.block([...statements]));
	}
}

/**
 * @param {Set<string>} keys
 * @param {AST.ConstTag} tag
 */
function has_reference(keys, tag) {
	for (const declaration of tag.declaration.declarations) {
		for (const id of extract_identifiers(declaration.id)) {
			if (keys.has(id.name)) {
				return true;
			}
		}
	}
	return false;
}
