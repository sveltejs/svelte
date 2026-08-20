/** @import { AST } from '#compiler'; */
/** @import { Context, Visitors } from 'esrap' */
import * as esrap from 'esrap';
import ts from 'esrap/languages/ts';
import { is_void } from '../../utils.js';

/** Threshold for when content should be formatted on separate lines */
const LINE_BREAK_THRESHOLD = 50;

/** Characters that are valid in a CSS identifier without escaping */
const REGEX_IDENTIFIER_CHAR = /^[a-zA-Z0-9_-]$/;

/** Hex digits — a backslash followed by one of these is read as a hex escape */
const REGEX_HEX_DIGIT = /[0-9a-fA-F]/;

/**
 * Re-escape a CSS identifier name so that it prints as valid CSS.
 *
 * `parse` decodes CSS escape sequences when building the AST — `\31` becomes `1`,
 * `\a` becomes a newline — but keeps single-character escapes such as `\.` and
 * escaped backslashes intact. When printing we therefore only need to escape the
 * characters that would be illegal in a bare identifier: a leading digit, `-`
 * followed by a digit, whitespace and control characters, and anything else that
 * is not already escaped.
 * @param {string} name
 */
function escape_identifier(name) {
	let escaped = '';
	let i = 0;

	while (i < name.length) {
		const char = name[i];

		if (char === '\\') {
			const next = name.charAt(i + 1);
			if (next === '' || REGEX_HEX_DIGIT.test(next)) {
				// A literal backslash in a name must itself be escaped: `\5c `
				// re-parses to a backslash, whereas a backslash followed by a hex
				// digit (or by nothing) would be read back as a hex escape.
				escaped += '\\5c ';
				i += 1;
				continue;
			}

			// Already escaped — copy the backslash and the escaped character as-is.
			escaped += '\\' + next;
			i += 2;
			continue;
		}

		const code = /** @type {number} */ (char.codePointAt(0));
		const is_leading_digit = i === 0 && char >= '0' && char <= '9';
		const is_leading_hyphen_digit =
			i === 0 && char === '-' && name.charAt(i + 1) >= '0' && name.charAt(i + 1) <= '9';

		if (
			is_leading_digit ||
			is_leading_hyphen_digit ||
			!(REGEX_IDENTIFIER_CHAR.test(char) || code >= 160)
		) {
			escaped += `\\${code.toString(16)} `;
		} else {
			escaped += char;
		}

		i += 1;
	}

	return escaped;
}

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
	const comments = (ast.type === 'Root' && ast.comments) || [];
	const state = { preserve_whitespace: 0 };
	const css_comments =
		(ast.type === 'Root' ? ast.css?.comments : ast.type === 'StyleSheet' ? ast.comments : null) ||
		[];

	return esrap.print(
		ast,
		/** @type {Visitors<AST.SvelteNode>} */ ({
			...ts({
				comments,
				getLeadingComments: options?.getLeadingComments,
				getTrailingComments: options?.getTrailingComments
			}),
			...svelte_visitors(comments, state),
			...css_visitors(css_comments, comments)
		}),
		{
			indent: options?.indent
		}
	);
}

/**
 * @param {Context} context
 * @param {AST.SvelteNode} node
 * @param {boolean} preserve_whitespace
 * @param {boolean} allow_inline
 */
function block(context, node, preserve_whitespace = false, allow_inline = false) {
	if (preserve_whitespace) {
		context.visit(node);
		return;
	}

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
 * @param {AST.BaseNode} node
 * @param {AST.BaseElement['attributes']} attributes
 * @param {Context} context
 * @param {AST.JSComment[]} comments
 * @returns {boolean} true if attributes were formatted on multiple lines
 */
function attributes(node, attributes, context, comments) {
	if (attributes.length === 0) {
		return false;
	}

	let length = -1;

	let comment_index = comments.findIndex((comment) => comment.start > node.start);

	if (comment_index === -1) {
		comment_index = comments.length;
	}

	const separator = context.new();
	let previous_attribute_end = node.start;

	const children = attributes.map((attribute) => {
		const child_context = context.new();

		while (comment_index < comments.length) {
			const comment = comments[comment_index];

			if (comment.start < attribute.start) {
				// Inside a previous attribute's value can be comments which don't
				// advance comment_index, therefore this additional check
				if (comment.start >= previous_attribute_end) {
					if (comment.type === 'Line') {
						child_context.write('//' + comment.value);
						child_context.newline();
					} else {
						child_context.write('/*' + comment.value + '*/'); // TODO match indentation?
						child_context.append(separator);
					}
				}

				comment_index += 1;
			} else {
				break;
			}
		}

		child_context.visit(attribute);
		previous_attribute_end = attribute.end;

		length += child_context.measure() + 1;

		return child_context;
	});

	let multiline = context.multiline || length > LINE_BREAK_THRESHOLD;

	if (multiline) {
		separator.newline();
		context.indent();
		for (const child of children) {
			context.newline();
			context.append(child);
		}
		context.dedent();
		context.newline();
	} else {
		separator.write(' ');
		for (const child of children) {
			context.write(' ');
			context.append(child);
		}
	}

	return multiline;
}

/**
 * @param {AST.BaseElement} node
 * @param {Context} context
 * @param {AST.JSComment[]} comments
 * @param {{ preserve_whitespace: number }} state
 */
function base_element(node, context, comments, state) {
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

	const multiline_attributes = attributes(node, node.attributes, child_context, comments);
	const is_doctype_node = node.name.toLowerCase() === '!doctype';
	const is_self_closing =
		is_void(node.name) || (node.type === 'Component' && node.fragment.nodes.length === 0);

	if (is_doctype_node) child_context.write(`>`);
	else if (is_self_closing) {
		child_context.write(`${multiline_attributes ? '' : ' '}/>`);
	} else {
		child_context.write('>');
		block(child_context, node.fragment, state.preserve_whitespace > 0, true);
		child_context.write(`</${node.name}>`);
	}

	context.append(child_context);
}

/**
 * @param {AST.BaseElement} node
 * @param {Context} context
 * @param {AST.JSComment[]} comments
 * @param {{ preserve_whitespace: number }} state
 */
function print_element(node, context, comments, state) {
	const name = node.name.toLowerCase();
	const preserve =
		(node.type === 'RegularElement' || node.type === 'TitleElement') &&
		(name === 'pre' || name === 'textarea' || name === 'title');

	if (preserve) state.preserve_whitespace += 1;
	base_element(node, context, comments, state);
	if (preserve) state.preserve_whitespace -= 1;
}

/**
 * @param {AST.CSS.CSSComment[]} comments
 * @param {AST.JSComment[]} js_comments
 * @returns {Visitors<AST.SvelteNode>}
 */
function css_visitors(comments, js_comments) {
	let comment_index = 0;

	/** @param {number} end */
	const has_comment_before = (end) => comments[comment_index]?.start < end;

	/**
	 * @param {Context} context
	 * @param {AST.CSS.CSSComment} comment
	 */
	function write_comment(context, comment) {
		context.write(`/*${comment.value}*/`);
	}

	/**
	 * @param {Context} context
	 * @param {number} end
	 */
	function write_inline_comments(context, end) {
		let written = false;

		while (has_comment_before(end)) {
			if (written) context.write(' ');
			write_comment(context, comments[comment_index++]);
			written = true;
		}

		return written;
	}

	/**
	 * @param {Context} context
	 * @param {string} value
	 * @param {number} end
	 */
	function write_value(context, value, end) {
		let offset = 0;

		while (has_comment_before(end)) {
			const comment = comments[comment_index++];
			const position = Math.max(offset, Math.min(comment.position ?? 0, value.length));
			context.write(value.slice(offset, position));
			write_comment(context, comment);
			offset = position;
		}

		context.write(value.slice(offset));
	}

	/**
	 * @param {Context} context
	 * @param {Array<AST.CSS.Rule | AST.CSS.Atrule | AST.CSS.Declaration>} children
	 * @param {number} end
	 * @param {boolean} margins
	 */
	function print_children(context, children, end, margins) {
		let started = false;

		const separate = () => {
			if (!started) return;
			if (margins) context.margin();
			context.newline();
		};

		for (const child of children) {
			while (has_comment_before(child.start)) {
				separate();
				write_comment(context, comments[comment_index++]);
				started = true;
			}

			separate();
			context.visit(child);
			started = true;
		}

		while (has_comment_before(end)) {
			separate();
			write_comment(context, comments[comment_index++]);
			started = true;
		}
	}

	/**
	 * @param {AST.CSS.SelectorList} node
	 * @param {Context} context
	 * @param {boolean} multiline
	 */
	function print_selector_list(node, context, multiline) {
		let needs_separator = false;
		let remaining_selectors = node.children.length;

		for (const selector of node.children) {
			while (has_comment_before(selector.start)) {
				if (needs_separator) context.write(' ');
				write_comment(context, comments[comment_index++]);
				needs_separator = true;
			}

			if (needs_separator) {
				if (multiline) context.newline();
				else context.write(' ');
			}

			context.visit(selector);
			needs_separator = true;
			remaining_selectors -= 1;

			if (remaining_selectors > 0) context.write(',');
		}
	}

	return {
		Atrule(node, context) {
			context.write(`@${escape_identifier(node.name)}`);

			const prelude_end = node.block?.start ?? node.end;
			if (node.prelude || has_comment_before(prelude_end)) {
				context.write(' ');
				write_value(context, node.prelude, prelude_end);
			}

			if (node.block) {
				context.write(' ');
				context.visit(node.block);
			} else {
				context.write(';');
			}
		},

		AttributeSelector(node, context) {
			context.write(`[${escape_identifier(node.name)}`);
			if (node.matcher) {
				context.write(node.matcher);
				context.write(`"${node.value}"`);
				if (node.flags) context.write(` ${node.flags}`);
			}
			context.write(']');
		},

		Block(node, context) {
			context.write('{');

			if (node.children.length > 0 || has_comment_before(node.end)) {
				context.indent();
				context.newline();
				print_children(context, node.children, node.end, false);
				context.dedent();
				context.newline();
			}

			context.write('}');
		},

		ClassSelector(node, context) {
			context.write(`.${escape_identifier(node.name)}`);
		},

		ComplexSelector(node, context) {
			for (const selector of node.children) context.visit(selector);
		},

		Declaration(node, context) {
			context.write(`${node.property}: `);
			write_value(context, node.value, node.end);
			context.write(';');
		},

		IdSelector(node, context) {
			context.write(`#${escape_identifier(node.name)}`);
		},

		NestingSelector(node, context) {
			context.write('&');
		},

		Nth(node, context) {
			context.write(node.value);
		},

		Percentage(node, context) {
			context.write(node.value);
		},

		PseudoClassSelector(node, context) {
			context.write(`:${escape_identifier(node.name)}`);

			if (node.args) {
				context.write('(');
				context.visit(node.args);
				if (has_comment_before(node.end)) {
					context.write(' ');
					write_inline_comments(context, node.end);
				}
				context.write(')');
			}
		},

		PseudoElementSelector(node, context) {
			context.write(`::${escape_identifier(node.name)}`);
			if (node.args) {
				context.write('(');
				context.visit(node.args);
				if (has_comment_before(node.end)) {
					context.write(' ');
					write_inline_comments(context, node.end);
				}
				context.write(')');
			}
		},

		RelativeSelector(node, context) {
			if (node.combinator) {
				if (node.combinator.name === ' ') context.write(' ');
				else context.write(` ${node.combinator.name} `);
			}

			for (const selector of node.selectors) context.visit(selector);
		},

		Rule(node, context) {
			print_selector_list(node.prelude, context, true);
			context.write(' ');
			if (write_inline_comments(context, node.block.start)) context.write(' ');
			context.visit(node.block);
		},

		SelectorList(node, context) {
			print_selector_list(node, context, false);
		},

		StyleSheet(node, context) {
			context.write('<style');
			attributes(node, node.attributes, context, js_comments);
			context.write('>');

			if (node.children.length > 0 || node.comments.length > 0) {
				context.indent();
				context.newline();
				print_children(context, node.children, node.content.end, true);
				context.dedent();
				context.newline();
			}

			context.write('</style>');
		},

		TypeSelector(node, context) {
			if (node.namespace !== undefined) {
				context.write(node.namespace === '*' ? '*' : escape_identifier(node.namespace));
				context.write('|');
			}
			context.write(node.name === '*' ? node.name : escape_identifier(node.name));
		}
	};
}

/**
 * @param {AST.JSComment[]} comments
 * @param {{ preserve_whitespace: number }} state
 * @returns {Visitors<AST.SvelteNode>}
 */
const svelte_visitors = (comments, state) => ({
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
		attributes(node, node.attributes, context, comments);
		context.write('>');
		block(context, node.content, state.preserve_whitespace > 0);
		context.write('</script>');
	},

	Fragment(node, context) {
		if (state.preserve_whitespace > 0) {
			for (const child of node.nodes) {
				context.visit(child);
				context.multiline ||= child.type === 'Text' && /[\r\n]/.test(child.data);
			}
			return;
		}

		const first = node.nodes[0];
		const last = node.nodes.at(-1);
		const has_surrounding_whitespace =
			first?.type === 'Text' &&
			/^\s/.test(first.data) &&
			last?.type === 'Text' &&
			/\s$/.test(last.data);

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
					child_node.type === 'SvelteBody' ||
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
		// Normally context.newline() also makes context.multiline true, but the below loop only
		// does that if we have more than one child context. If there's one long text block inside
		// with whitespace at the edges we wanna split that up, too.
		context.multiline ||= has_surrounding_whitespace && width > LINE_BREAK_THRESHOLD * 2;

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
			block(context, node.pending, state.preserve_whitespace > 0);
			context.write('{:');
		} else {
			context.write(' ');
		}

		if (node.then) {
			context.write(node.value ? 'then ' : 'then');
			if (node.value) context.visit(node.value);
			context.write('}');

			block(context, node.then, state.preserve_whitespace > 0);

			if (node.catch) {
				context.write('{:');
			}
		}

		if (node.catch) {
			context.write(node.error ? 'catch ' : 'catch');
			if (node.error) context.visit(node.error);
			context.write('}');

			block(context, node.catch, state.preserve_whitespace > 0);
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
		print_element(node, context, comments, state);
	},

	ConstTag(node, context) {
		context.write('{@const ');
		const declarators = node.declaration.declarations;
		for (let i = 0; i < declarators.length; i++) {
			if (i > 0) context.write(', ');
			context.visit(declarators[i]);
		}

		context.write('}');
	},

	DeclarationTag(node, context) {
		context.write('{');

		// This is duplicated from esrap's handling of VariableDeclaration,
		// which we need to do in order to omit the trailing semicolon that esrap would add.
		const open = context.new();
		const join = context.new();
		const child_context = context.new();

		context.append(child_context);

		child_context.write(`${node.declaration.kind} `);
		child_context.append(open);

		const declarations = node.declaration.declarations;
		let first = true;

		for (const d of declarations) {
			if (!first) child_context.append(join);
			first = false;

			child_context.visit(d);
		}

		const length = child_context.measure() + 2 * (declarations.length - 1);

		const multiline = child_context.multiline || (declarations.length > 1 && length > 50);

		if (multiline) {
			context.multiline = true;

			if (declarations.length > 1) open.indent();
			join.write(',');
			join.newline();
			if (declarations.length > 1) context.dedent();
		} else {
			join.write(', ');
		}

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

		block(context, node.body, state.preserve_whitespace > 0);

		if (node.fallback) {
			context.write('{:else}');
			block(context, node.fallback, state.preserve_whitespace > 0);
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

			block(context, node.consequent, state.preserve_whitespace > 0);
		} else {
			context.write('{#if ');
			context.visit(node.test);
			context.write('}');

			block(context, node.consequent, state.preserve_whitespace > 0);
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
				block(context, node.alternate, state.preserve_whitespace > 0);
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
		block(context, node.fragment, state.preserve_whitespace > 0);
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
		print_element(node, context, comments, state);
	},

	RenderTag(node, context) {
		context.write('{@render ');
		context.visit(node.expression);
		context.write('}');
	},

	SlotElement(node, context) {
		print_element(node, context, comments, state);
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
		block(context, node.body, state.preserve_whitespace > 0);
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

	SvelteBody(node, context) {
		print_element(node, context, comments, state);
	},

	SvelteBoundary(node, context) {
		print_element(node, context, comments, state);
	},

	SvelteComponent(node, context) {
		context.write('<svelte:component');

		context.write(' this={');
		context.visit(node.expression);
		context.write('}');
		attributes(node, node.attributes, context, comments);
		if (node.fragment && node.fragment.nodes.length > 0) {
			context.write('>');
			block(context, node.fragment, state.preserve_whitespace > 0, true);
			context.write(`</svelte:component>`);
		} else {
			context.write(' />');
		}
	},

	SvelteDocument(node, context) {
		print_element(node, context, comments, state);
	},

	SvelteElement(node, context) {
		context.write('<svelte:element ');

		context.write('this={');
		context.visit(node.tag);
		context.write('}');
		attributes(node, node.attributes, context, comments);

		if (node.fragment && node.fragment.nodes.length > 0) {
			context.write('>');
			block(context, node.fragment, state.preserve_whitespace > 0);
			context.write(`</svelte:element>`);
		} else {
			context.write(' />');
		}
	},

	SvelteFragment(node, context) {
		print_element(node, context, comments, state);
	},

	SvelteHead(node, context) {
		print_element(node, context, comments, state);
	},

	SvelteSelf(node, context) {
		print_element(node, context, comments, state);
	},

	SvelteWindow(node, context) {
		print_element(node, context, comments, state);
	},

	Text(node, context) {
		context.write(node.data);
	},

	TitleElement(node, context) {
		print_element(node, context, comments, state);
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
});
