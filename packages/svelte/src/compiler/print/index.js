/** @import { AST } from '#compiler'; */
/** @import { Visitors } from 'esrap' */
import * as esrap from 'esrap';
import ts from 'esrap/languages/ts';
import { is_void } from '../../utils.js';

/**
 * @param {AST.SvelteNode} ast
 */
export function print(ast) {
	// @ts-expect-error some bullshit
	return esrap.print(ast, {
		// @ts-expect-error some bullshit
		...ts({ comments: ast.type === 'Root' ? ast.comments : [] }),
		...visitors
	});
}

/** @type {Visitors<AST.SvelteNode | AST.CSS.Node, any>} */
const visitors = {
	Root(node, context) {
		if (node.options) {
			context.write('<svelte:options');

			for (const attribute of node.options.attributes) {
				context.write(' ');
				context.visit(attribute);
			}

			context.write(' />');
		}

		let started = false;

		for (const item of [node.module, node.instance, node.fragment, node.css]) {
			if (!item) continue;

			if (started) {
				context.margin();
				context.newline();
			}

			context.visit(item);
			started = true;
		}
	},

	Script(node, context) {
		context.write('<script');

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

	AnimateDirective(node, context) {
		context.write(`animate:${node.name}`);
		if (
			node.expression !== null &&
			!(node.expression.type === 'Identifier' && node.expression.name === node.name)
		) {
			context.write('={');
			context.visit(node.expression);
			context.write('}');
		}
	},

	Atrule(node, context) {
		context.write(`@${node.name}`);
		if (node.prelude) context.write(` ${node.prelude}`);

		if (node.block) {
			context.write(' ');
			context.visit(node.block);
		} else {
			context.write(';');
		}
	},

	AttachTag(node, context) {
		context.write('{@attach ');
		context.visit(node.expression);
		context.write('}');
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

	AwaitBlock(node, context) {
		context.write(`{#await `);
		context.visit(node.expression);

		if (node.pending) {
			context.write('}');
			context.visit(node.pending);
			context.write('{:');
		} else {
			context.write(' ');
		}

		if (node.then) {
			context.write(node.value ? 'then ' : 'then');
			if (node.value) context.visit(node.value);
			context.write('}');
			context.visit(node.then);

			if (node.catch) {
				context.write('{:');
			}
		}

		if (node.catch) {
			context.write(node.value ? 'catch ' : 'catch');
			if (node.error) context.visit(node.error);
			context.write('}');
			context.visit(node.catch);
		}

		context.write('{/await}');
	},

	BindDirective(node, context) {
		context.write(`bind:${node.name}`);

		if (node.expression.type === 'Identifier' && node.expression.name === node.name) {
			// shorthand
			return;
		}

		context.write('={');

		if (node.expression.type === 'SequenceExpression') {
			context.visit(node.expression.expressions[0]);
			context.write(', ');
			context.visit(node.expression.expressions[1]);
		} else {
			context.visit(node.expression);
		}

		context.write('}');
	},

	Block(node, context) {
		context.write('{');

		if (node.children.length > 0) {
			context.indent();
			context.newline();

			let started = false;

			for (const child of node.children) {
				if (started) {
					context.margin();
					context.newline();
				}

				context.visit(child);

				started = true;
			}

			context.dedent();
			context.newline();
		}

		context.write('}');
	},

	ClassDirective(node, context) {
		context.write(`class:${node.name}`);
		if (
			node.expression !== null &&
			!(node.expression.type === 'Identifier' && node.expression.name === node.name)
		) {
			context.write('={');
			context.visit(node.expression);
			context.write('}');
		}
	},

	ClassSelector(node, context) {
		context.write(`.${node.name}`);
	},

	Comment(node, context) {
		context.write('<!--' + node.data + '-->');
	},

	ComplexSelector(node, context) {
		for (const selector of node.children) {
			context.visit(selector);
		}
	},

	Component(node, context) {
		context.write(`<${node.name}`);

		for (let i = 0; i < node.attributes.length; i += 1) {
			context.write(' ');
			context.visit(node.attributes[i]);
		}

		if (node.fragment.nodes.length > 0) {
			context.write('>');
			context.visit(node.fragment);
			context.write(`</${node.name}>`);
		} else {
			context.write(' />');
		}
	},

	ConstTag(node, context) {
		context.write('{@const ');
		context.visit(node.declaration); // TODO does this work?
		context.write('}');
	},

	DebugTag(node, context) {
		context.write('{@debug ');
		let started = false;
		for (const identifier of node.identifiers) {
			if (started) {
				context.write(', ');
			}
			context.visit(identifier);
			started = true;
		}
		context.write('}');
	},

	Declaration(node, context) {
		context.write(`${node.property}: ${node.value};`);
	},

	EachBlock(node, context) {
		context.write('{#each ');
		context.visit(node.expression);

		if (node.context) {
			context.write(' as ');
			context.visit(node.context);
		}

		if (node.index) {
			context.write(`, ${node.index}`);
		}

		if (node.key) {
			context.write(' (');
			context.visit(node.key);
			context.write(')');
		}

		context.write('}');
		context.visit(node.body);

		if (node.fallback) {
			context.write('{:else}');
			context.visit(node.fallback);
		}

		context.write('{/each}');
	},

	ExpressionTag(node, context) {
		context.write('{');
		context.visit(node.expression);
		context.write('}');
	},

	HtmlTag(node, context) {
		context.write('{@html ');
		context.visit(node.expression);
		context.write('}');
	},

	IfBlock(node, context) {
		if (node.elseif) {
			context.write('{:else if ');
			context.visit(node.test);
			context.write('}');
			context.visit(node.consequent);
		} else {
			context.write('{#if ');
			context.visit(node.test);
			context.write('}');

			context.visit(node.consequent);
		}
		if (node.alternate !== null) {
			if (
				!(
					node.alternate.nodes.length === 1 &&
					node.alternate.nodes[0].type === 'IfBlock' &&
					node.alternate.nodes[0].elseif
				)
			) {
				context.write('{:else}');
			}
			context.visit(node.alternate);
		}
		if (!node.elseif) {
			context.write('{/if}');
		}
	},

	LetDirective(node, context) {
		context.write(`let:${node.name}`);
		if (
			node.expression !== null &&
			!(node.expression.type === 'Identifier' && node.expression.name === node.name)
		) {
			context.write('={');
			context.visit(node.expression);
			context.write('}');
		}
	},

	Nth(node, context) {
		context.write(node.value); // TODO is this right?
	},

	OnDirective(node, context) {
		context.write(`on:${node.name}`);
		for (const modifier of node.modifiers) {
			context.write(`|${modifier}`);
		}
		if (
			node.expression !== null &&
			!(node.expression.type === 'Identifier' && node.expression.name === node.name)
		) {
			context.write('={');
			context.visit(node.expression);
			context.write('}');
		}
	},

	PseudoClassSelector(node, context) {
		context.write(`:${node.name}`);

		if (node.args) {
			context.write('(');

			let started = false;

			for (const arg of node.args.children) {
				if (started) {
					context.write(', ');
				}

				context.visit(arg);

				started = true;
			}

			context.write(')');
		}
	},

	PseudoElementSelector(node, context) {
		context.write(`::${node.name}`);
	},

	RegularElement(node, context) {
		context.write('<' + node.name);

		for (const attribute of node.attributes) {
			// TODO handle multiline
			context.write(' ');
			context.visit(attribute);
		}

		if (is_void(node.name)) {
			context.write(' />');
		} else {
			context.write('>');

			if (node.fragment) {
				context.visit(node.fragment);
				context.write(`</${node.name}>`);
			}
		}
	},

	RelativeSelector(node, context) {
		if (node.combinator) {
			if (node.combinator.name === ' ') {
				context.write(' ');
			} else {
				context.write(` ${node.combinator.name} `);
			}
		}

		for (const selector of node.selectors) {
			context.visit(selector);
		}
	},

	RenderTag(node, context) {
		context.write('{@render ');
		context.visit(node.expression);
		context.write('}');
	},

	Rule(node, context) {
		let started = false;

		for (const selector of node.prelude.children) {
			if (started) {
				context.write(',');
				context.newline();
			}

			context.visit(selector);
			started = true;
		}

		context.write(' ');
		context.visit(node.block);
	},

	SlotElement(node, context) {
		context.write('<slot');

		for (let i = 0; i < node.attributes.length; i += 1) {
			context.write(' ');
			context.visit(node.attributes[i]);
		}

		if (node.fragment.nodes.length > 0) {
			context.write('>');
			context.visit(node.fragment);
			context.write('</slot>');
		} else {
			context.write(' />');
		}
	},

	SnippetBlock(node, context) {
		context.write('{#snippet ');
		context.visit(node.expression);

		if (node.typeParams) {
			context.write(`<${node.typeParams}>`);
		}

		context.write('(');

		for (let i = 0; i < node.parameters.length; i += 1) {
			if (i > 0) context.write(', ');
			context.visit(node.parameters[i]);
		}

		context.write(')}');
		context.visit(node.body);
		context.write('{/snippet}');
	},

	SpreadAttribute(node, context) {
		context.write('{...');
		context.visit(node.expression);
		context.write('}');
	},

	StyleDirective(node, context) {
		context.write(`style:${node.name}`);
		for (const modifier of node.modifiers) {
			context.write(`|${modifier}`);
		}
		if (
			node.expression !== null &&
			!(node.expression.type === 'Identifier' && node.expression.name === node.name)
		) {
			context.write('={');
			context.visit(node.expression);
			context.write('}');
		}
	},

	StyleSheet(node, context) {
		context.write('<style');

		for (const attribute of node.attributes) {
			context.write(' ');
			context.visit(attribute);
		}

		context.write('>');

		if (node.children.length > 0) {
			context.indent();
			context.newline();

			let started = false;

			for (const child of node.children) {
				if (started) {
					context.margin();
					context.newline();
				}

				context.visit(child);
				started = true;
			}

			context.dedent();
			context.newline();
		}

		context.write('</style>');
	},

	Text(node, context) {
		context.write(node.data);
	},

	TransitionDirective(node, context) {
		const directive = node.intro && node.outro ? 'transition' : node.intro ? 'in' : 'out';
		context.write(`${directive}:${node.name}`);
		for (const modifier of node.modifiers) {
			context.write(`|${modifier}`);
		}
		if (
			node.expression !== null &&
			!(node.expression.type === 'Identifier' && node.expression.name === node.name)
		) {
			context.write('={');
			context.visit(node.expression);
			context.write('}');
		}
	},

	TypeSelector(node, context) {
		context.write(node.name);
	},

	UseDirective(node, context) {
		context.write(`use:${node.name}`);
		if (
			node.expression !== null &&
			!(node.expression.type === 'Identifier' && node.expression.name === node.name)
		) {
			context.write('={');
			context.visit(node.expression);
			context.write('}');
		}
	}
};
