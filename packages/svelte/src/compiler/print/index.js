/** @import { AST } from '#compiler'; */
/** @import { Context, Visitors } from 'esrap' */
import * as esrap from 'esrap';
import ts from 'esrap/languages/ts';
import { is_void } from '../../utils.js';

/** Threshold for when content should be formatted on separate lines */
const LINE_BREAK_THRESHOLD = 50;

/**
 * `print` converts a Svelte AST node back into Svelte source code.
 * It is primarily intended for tools that parse and transform components using the compiler’s modern AST representation.
 *
 * `print(ast)` requires an AST node produced by parse with modern: true, or any sub-node within that modern AST.
 * The result contains the generated source and a corresponding source map.
 * The output is valid Svelte, but formatting details such as whitespace or quoting may differ from the original.
 * @param {AST.SvelteNode} ast
 * @param {import('./types.js').Options | undefined} options
 */
export function print(ast, options = undefined) {
	return esrap.print(
		ast,
		/** @type {Visitors<AST.SvelteNode>} */ ({
			...ts({
				comments: ast.type === 'Root' ? ast.comments : [],
				getLeadingComments: options?.getLeadingComments,
				getTrailingComments: options?.getTrailingComments
			}),
			...svelte_visitors,
			...css_visitors
		})
	);
}

/**
 * @param {Context} context
 * @param {AST.SvelteNode} node
 * @param {boolean} allow_inline
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

/**
 * @param {AST.BaseElement['attributes']} attributes
 * @param {Context} context
 * @returns {boolean} true if attributes were formatted on multiple lines
 */
function attributes(attributes, context) {
	if (attributes.length === 0) {
		return false;
	}

	// Measure total width of all attributes when rendered inline
	const child_context = context.new();

	for (const attribute of attributes) {
		child_context.write(' ');
		child_context.visit(attribute);
	}

	const multiline = child_context.measure() > LINE_BREAK_THRESHOLD;

	if (multiline) {
		context.indent();
		for (const attribute of attributes) {
			context.newline();
			context.visit(attribute);
		}
		context.dedent();
		context.newline();
	} else {
		context.append(child_context);
	}

	return multiline;
}

/**
 * @param {AST.BaseElement} node
 * @param {Context} context
 */
function base_element(node, context) {
	const child_context = context.new();

	child_context.write('<' + node.name);

	// Handle special Svelte components/elements that need 'this' attribute
	if (node.type === 'SvelteComponent') {
		child_context.write(' this={');
		child_context.visit(/** @type {AST.SvelteComponent} */ (node).expression);
		child_context.write('}');
	} else if (node.type === 'SvelteElement') {
		child_context.write(' this={');
		child_context.visit(/** @type {AST.SvelteElement} */ (node).tag);
		child_context.write('}');
	}

	const multiline_attributes = attributes(node.attributes, child_context);
	const is_doctype_node = node.name.toLowerCase() === '!doctype';
	const is_self_closing =
		is_void(node.name) || (node.type === 'Component' && node.fragment.nodes.length === 0);

	if (is_doctype_node) child_context.write(`>`);
	else if (is_self_closing) {
		child_context.write(`${multiline_attributes ? '' : ' '}/>`);
	} else {
		child_context.write('>');
		block(child_context, node.fragment, true);
		child_context.write(`</${node.name}>`);
	}

	context.append(child_context);
}

/** @type {Visitors<AST.SvelteNode>} */
const css_visitors = {
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

	AttributeSelector(node, context) {
		context.write(`[${node.name}`);
		if (node.matcher) {
			context.write(node.matcher);
			context.write(`"${node.value}"`);
			if (node.flags) {
				context.write(` ${node.flags}`);
			}
		}
		context.write(']');
	},

	Block(node, context) {
		context.write('{');

		if (node.children.length > 0) {
			context.indent();
			context.newline();

			let started = false;

			for (const child of node.children) {
				if (started) {
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

	ClassSelector(node, context) {
		context.write(`.${node.name}`);
	},

	ComplexSelector(node, context) {
		for (const selector of node.children) {
			context.visit(selector);
		}
	},

	Declaration(node, context) {
		context.write(`${node.property}: ${node.value};`);
	},

	IdSelector(node, context) {
		context.write(`#${node.name}`);
	},

	NestingSelector(node, context) {
		context.write('&');
	},

	Nth(node, context) {
		context.write(node.value);
	},

	Percentage(node, context) {
		context.write(`${node.value}%`);
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

	TypeSelector(node, context) {
		context.write(node.name);
	}
};

/** @type {Visitors<AST.SvelteNode>} */
const svelte_visitors = {
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
		attributes(node.attributes, context);
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
				const is_block_element =
					child_node.type === 'RegularElement' ||
					child_node.type === 'Component' ||
					child_node.type === 'SvelteHead' ||
					child_node.type === 'SvelteFragment' ||
					child_node.type === 'SvelteBoundary' ||
					child_node.type === 'SvelteDocument' ||
					child_node.type === 'SvelteSelf' ||
					child_node.type === 'SvelteWindow' ||
					child_node.type === 'SvelteComponent' ||
					child_node.type === 'SvelteElement' ||
					child_node.type === 'SlotElement' ||
					child_node.type === 'TitleElement';

				if (is_block_element && sequence.length > 0) flush();
				sequence.push(child_node);
				if (is_block_element) flush();
			}
		}

		flush();

		let multiline = false;
		let width = 0;

		const child_contexts = items
			.filter((x) => x.length > 0)
			.map((sequence) => {
				const child_context = context.new();

				for (const node of sequence) {
					child_context.visit(node);
					multiline ||= child_context.multiline;
				}

				width += child_context.measure();

				return child_context;
			});

		multiline ||= width > LINE_BREAK_THRESHOLD;

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

	Comment(node, context) {
		context.write('<!--' + node.data + '-->');
	},

	Component(node, context) {
		base_element(node, context);
	},

	ConstTag(node, context) {
		context.write('{@');
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
			context.write('{:else}');
			block(context, node.fallback);
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
				block(context, node.alternate);
			} else {
				context.visit(node.alternate);
			}
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

	RegularElement(node, context) {
		base_element(node, context);
	},

	RenderTag(node, context) {
		context.write('{@render ');
		context.visit(node.expression);
		context.write('}');
	},

	SlotElement(node, context) {
		base_element(node, context);
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
		attributes(node.attributes, context);
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
		base_element(node, context);
	},

	SvelteComponent(node, context) {
		context.write('<svelte:component');

		context.write(' this={');
		context.visit(node.expression);
		context.write('}');
		attributes(node.attributes, context);
		if (node.fragment && node.fragment.nodes.length > 0) {
			context.write('>');
			block(context, node.fragment, true);
			context.write(`</svelte:component>`);
		} else {
			context.write(' />');
		}
	},

	SvelteDocument(node, context) {
		base_element(node, context);
	},

	SvelteElement(node, context) {
		context.write('<svelte:element ');

		context.write('this={');
		context.visit(node.tag);
		context.write('}');
		attributes(node.attributes, context);

		if (node.fragment && node.fragment.nodes.length > 0) {
			context.write('>');
			block(context, node.fragment);
			context.write(`</svelte:element>`);
		} else {
			context.write(' />');
		}
	},

	SvelteFragment(node, context) {
		base_element(node, context);
	},

	SvelteHead(node, context) {
		base_element(node, context);
	},

	SvelteSelf(node, context) {
		base_element(node, context);
	},

	SvelteWindow(node, context) {
		base_element(node, context);
	},

	Text(node, context) {
		context.write(node.data);
	},

	TitleElement(node, context) {
		base_element(node, context);
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
