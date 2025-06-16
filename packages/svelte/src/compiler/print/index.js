/** @import { AST } from '#compiler'; */
/** @import { Visitors } from 'esrap' */
import * as esrap from 'esrap';
import ts from 'esrap/languages/ts';

/**
 * @param {AST.SvelteNode} ast
 */
export function print(ast) {
	// @ts-expect-error some bullshit
	return esrap.print(ast, {
		...ts(),
		...visitors
	});
}

/** @type {Visitors<AST.SvelteNode>} */
const visitors = {
	Root(node, context) {
		if (node.options) {
			throw new Error('TODO');
		}

		for (const item of [node.module, node.instance, node.fragment, node.css]) {
			if (!item) continue;

			context.margin();
			context.newline();
			context.visit(item);
		}
	},
	Script(node, context) {
		context.write('<script');

		if (node.context === 'module') {
			context.write(' module');
		}

		for (const attribute of node.attributes) {
			context.write(' ');
			context.visit(attribute);
		}

		context.write('>');

		context.indent();
		context.newline();
		context.visit(node.content);
		context.dedent();
		context.newline();

		context.write('</script>');
	},
	Fragment(node, context) {
		for (let i = 0; i < node.nodes.length; i += 1) {
			const child = node.nodes[i];

			if (child.type === 'Text') {
				let data = child.data;

				if (i === 0) data = data.trimStart();
				if (i === node.nodes.length - 1) data = data.trimEnd();

				context.write(data);
			} else {
				context.visit(child);
			}
		}
	},
	Attribute(node, context) {
		context.write(node.name);

		if (node.value === true) return;

		context.write('=');

		if (Array.isArray(node.value)) {
			if (node.value.length > 1) {
				context.write('"');
			}

			for (const chunk of node.value) {
				context.visit(chunk);
			}

			if (node.value.length > 1) {
				context.write('"');
			}
		} else {
			context.visit(node.value);
		}
	},
	Text(node, context) {
		context.write(node.data);
	},
	ExpressionTag(node, context) {
		context.write('{');
		context.visit(node.expression);
		context.write('}');
	},
	IfBlock(node, context) {
		context.write('{#if ');
		context.visit(node.test);
		context.write('}');

		context.visit(node.consequent);

		// TODO handle alternate/else if

		context.write('{/if}');
	},
	RegularElement(node, context) {
		context.write('<' + node.name);

		for (const attribute of node.attributes) {
			// TODO handle multiline
			context.write(' ');
			context.visit(attribute);
		}

		context.write('>');

		// TODO handle void elements
		if (node.fragment) {
			context.visit(node.fragment);
		}

		context.write(`</${node.name}>`);
	},
	TransitionDirective(node, context) {
		// TODO
	}
};
