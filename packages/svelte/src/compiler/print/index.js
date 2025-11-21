/** @import { AST } from '#compiler'; */
/** @import { Context, Visitors } from 'esrap' */
import * as esrap from 'esrap';
import ts from 'esrap/languages/ts';
import { is_void } from '../../utils.js';

/**
 * @param {AST.SvelteNode} ast
 */
export function print(ast) {
	return esrap.print(
		ast,
		/** @type {Visitors<AST.SvelteNode>} */ ({
			...ts({ comments: ast.type === 'Root' ? ast.comments : [] }),
			...visitors
		})
	);
}

/**
 * @param {Context} context
 * @param {AST.SvelteNode} node
 */
function block(context, node, allow_inline = false) {
	const child_context = context.new();
	child_context.visit(node);

	if (child_context.empty()) {
		return;
	}

	if (allow_inline && !child_context.multiline) {
		context.append(child_context);
	} else {
		context.indent();
		context.newline();
		context.append(child_context);
		context.dedent();
		context.newline();
	}
}

/** @type {Visitors<AST.SvelteNode>} */
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
		block(context, node.content);
		context.write('</script>');
	},

	Fragment(node, context) {
		/** @type {AST.SvelteNode[][]} */
		const items = [];

		/** @type {AST.SvelteNode[]} */
		let sequence = [];

		const flush = () => {
			items.push(sequence);
			sequence = [];
		};

		for (let i = 0; i < node.nodes.length; i += 1) {
			let child_node = node.nodes[i];

			const prev = node.nodes[i - 1];
			const next = node.nodes[i + 1];

			if (child_node.type === 'Text') {
				child_node = { ...child_node }; // always clone, so we can safely mutate

				child_node.data = child_node.data.replace(/[^\S]+/g, ' ');

				// trim fragment
				if (i === 0) {
					child_node.data = child_node.data.trimStart();
				}

				if (i === node.nodes.length - 1) {
					child_node.data = child_node.data.trimEnd();
				}

				if (child_node.data === '') {
					continue;
				}

				if (child_node.data.startsWith(' ') && prev && prev.type !== 'ExpressionTag') {
					flush();
					child_node.data = child_node.data.trimStart();
				}

				if (child_node.data !== '') {
					sequence.push({ ...child_node, data: child_node.data });

					if (child_node.data.endsWith(' ') && next && next.type !== 'ExpressionTag') {
						flush();
						child_node.data = child_node.data.trimStart();
					}
				}
			} else {
				sequence.push(child_node);
			}
		}

		flush();

		let multiline = false;
		let width = 0;

		const child_contexts = items.map((sequence) => {
			const child_context = context.new();

			for (const node of sequence) {
				child_context.visit(node);
				multiline ||= child_context.multiline;
			}

			width += child_context.measure();

			return child_context;
		});

		multiline ||= width > 30;

		for (let i = 0; i < child_contexts.length; i += 1) {
			const prev = child_contexts[i];
			const next = child_contexts[i + 1];

			context.append(prev);

			if (next) {
				if (prev.multiline || next.multiline) {
					context.margin();
					context.newline();
				} else if (multiline) {
					context.newline();
				} else {
					context.write(' ');
				}
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
		// TODO seems to produce too many new lines sometimes. Also new lines above style tag?
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
			if (node.value.length > 1 || node.value[0].type === 'Text') {
				context.write('"');
			}

			for (const chunk of node.value) {
				context.visit(chunk);
			}

			if (node.value.length > 1 || node.value[0].type === 'Text') {
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
			block(context, node.pending);
			context.write('{:');
		} else {
			context.write(' ');
		}

		if (node.then) {
			context.write(node.value ? 'then ' : 'then');
			if (node.value) context.visit(node.value);
			context.write('}');

			block(context, node.then);

			if (node.catch) {
				context.write('{:');
			}
		}

		if (node.catch) {
			context.write(node.value ? 'catch ' : 'catch');
			if (node.error) context.visit(node.error);
			context.write('}');

			block(context, node.catch);
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
			block(context, node.fragment, true);
			context.write(`</${node.name}>`);
		} else {
			context.write(' />');
		}
	},

	ConstTag(node, context) {
		// TODO this is buggy
		context.write('{@const ');
		context.visit(node.declaration);
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

		block(context, node.body);

		if (node.fallback) {
			// TODO new lines
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

			block(context, node.consequent);
		} else {
			context.write('{#if ');
			context.visit(node.test);
			context.write('}');

			block(context, node.consequent);
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

			// TODO inconsistent indentation behavior here
			block(context, node.alternate);
		}

		if (!node.elseif) {
			context.write('{/if}');
		}
	},

	KeyBlock(node, context) {
		context.write('{#key ');
		context.visit(node.expression);
		context.write('}');
		block(context, node.fragment);
		context.write('{/key}');
	},

	LetDirective(node, context) {
		// TODO new lines
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
		const child_context = context.new();

		child_context.write('<' + node.name);

		for (const attribute of node.attributes) {
			// TODO handle multiline
			child_context.write(' ');
			child_context.visit(attribute);
		}

		if (is_void(node.name)) {
			child_context.write(' />');
		} else {
			child_context.write('>');

			if (node.fragment) {
				block(child_context, node.fragment, child_context.measure() < 30);
				child_context.write(`</${node.name}>`);
			}
		}

		context.append(child_context);
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

	SelectorList(node, context) {
		let started = false;
		for (const selector of node.children) {
			if (started) {
				context.write(', ');
			}

			context.visit(selector);
			started = true;
		}
	},

	SlotElement(node, context) {
		context.write('<slot');

		for (let i = 0; i < node.attributes.length; i += 1) {
			context.write(' ');
			context.visit(node.attributes[i]);
		}

		if (node.fragment.nodes.length > 0) {
			context.write('>');
			context.visit(node.fragment); // TODO block/inline
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
		block(context, node.body);
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

		if (node.value === true) {
			return;
		}

		context.write('=');

		if (Array.isArray(node.value)) {
			context.write('"');

			for (const tag of node.value) {
				context.visit(tag);
			}

			context.write('"');
		} else {
			context.visit(node.value);
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

	SvelteBoundary(node, context) {
		context.write('<svelte:boundary');

		for (const attribute of node.attributes) {
			// TODO handle multiline
			context.write(' ');
			context.visit(attribute);
		}

		if (node.fragment) {
			context.write('>');
			block(context, node.fragment, true);
			context.write(`</svelte:boundary>`);
		} else {
			context.write('/>');
		}
	},

	SvelteComponent(node, context) {
		context.write('<svelte:component');

		context.write('this={');
		context.visit(node.expression);
		context.write('} ');

		for (const attribute of node.attributes) {
			// TODO handle multiline
			context.write(' ');
			context.visit(attribute);
		}

		if (node.fragment) {
			context.write('>');
			block(context, node.fragment, true);
			context.write(`</svelte:component>`);
		} else {
			context.write('/>');
		}
	},

	SvelteDocument(node, context) {
		context.write('<svelte:document');

		for (const attribute of node.attributes) {
			// TODO handle multiline
			context.write(' ');
			context.visit(attribute);
		}

		if (node.fragment) {
			context.write('>');
			block(context, node.fragment, true);
			context.write(`</svelte:document>`);
		} else {
			context.write('/>');
		}
	},

	SvelteElement(node, context) {
		context.write('<svelte:element');

		context.write('this={');
		context.visit(node.tag);
		context.write('} ');

		for (const attribute of node.attributes) {
			// TODO handle multiline
			context.write(' ');
			context.visit(attribute);
		}

		if (node.fragment) {
			context.write('>');
			block(context, node.fragment, true);
			context.write(`</svelte:element>`);
		} else {
			context.write('/>');
		}
	},

	SvelteFragment(node, context) {
		context.write('<svelte:fragment');

		for (const attribute of node.attributes) {
			// TODO handle multiline
			context.write(' ');
			context.visit(attribute);
		}

		if (node.fragment) {
			context.write('>');
			block(context, node.fragment, true);
			context.write(`</svelte:fragment>`);
		} else {
			context.write('/>');
		}
	},

	SvelteHead(node, context) {
		context.write('<svelte:head');

		for (const attribute of node.attributes) {
			// TODO handle multiline
			context.write(' ');
			context.visit(attribute);
		}

		if (node.fragment) {
			context.write('>');
			block(context, node.fragment, true);
			context.write(`</svelte:head>`);
		} else {
			context.write('/>');
		}
	},

	SvelteSelf(node, context) {
		context.write('<svelte:self');

		for (const attribute of node.attributes) {
			// TODO handle multiline
			context.write(' ');
			context.visit(attribute);
		}

		if (node.fragment) {
			context.write('>');
			block(context, node.fragment, true);
			context.write(`</svelte:self>`);
		} else {
			context.write('/>');
		}
	},

	SvelteWindow(node, context) {
		context.write('<svelte:window');

		for (const attribute of node.attributes) {
			// TODO handle multiline
			context.write(' ');
			context.visit(attribute);
		}

		if (node.fragment) {
			context.write('>');
			block(context, node.fragment, true);
			context.write(`</svelte:window>`);
		} else {
			context.write('/>');
		}
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
