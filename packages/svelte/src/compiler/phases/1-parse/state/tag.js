import read_pattern from '../read/context.js';
import read_expression from '../read/expression.js';
import * as e from '../../../errors.js';
import { create_fragment } from '../utils/create.js';
import { walk } from 'zimmerframe';
import { parse_expression_at } from '../acorn.js';

const regex_whitespace_with_closing_curly_brace = /^\s*}/;

/** @param {import('../index.js').Parser} parser */
export default function tag(parser) {
	const start = parser.index;
	parser.index += 1;

	parser.allow_whitespace();

	if (parser.eat('#')) return open(parser);
	if (parser.eat('/')) return close(parser);
	if (parser.eat(':')) return next(parser);
	if (parser.eat('@')) return special(parser);

	const expression = read_expression(parser);

	parser.allow_whitespace();
	parser.eat('}', true);

	/** @type {ReturnType<typeof parser.append<import('#compiler').ExpressionTag>>} */
	parser.append({
		type: 'ExpressionTag',
		start,
		end: parser.index,
		expression,
		metadata: {
			contains_call_expression: false,
			dynamic: false
		}
	});
}

/** @param {import('../index.js').Parser} parser */
function open(parser) {
	let start = parser.index - 2;
	while (parser.template[start] !== '{') start -= 1;

	if (parser.eat('if')) {
		parser.require_whitespace();

		/** @type {ReturnType<typeof parser.append<import('#compiler').IfBlock>>} */
		const block = parser.append({
			type: 'IfBlock',
			elseif: false,
			start,
			end: -1,
			test: read_expression(parser),
			consequent: create_fragment(),
			alternate: null
		});

		parser.allow_whitespace();
		parser.eat('}', true);

		parser.stack.push(block);
		parser.fragments.push(block.consequent);

		return;
	}

	if (parser.eat('each')) {
		parser.require_whitespace();

		const template = parser.template;
		let end = parser.template.length;

		/** @type {import('estree').Expression | undefined} */
		let expression;

		// we have to do this loop because `{#each x as { y = z }}` fails to parse —
		// the `as { y = z }` is treated as an Expression but it's actually a Pattern.
		// the 'fix' is to backtrack and hide everything from the `as` onwards, until
		// we get a valid expression
		while (!expression) {
			try {
				expression = read_expression(parser);
			} catch (err) {
				end = /** @type {any} */ (err).position[0] - 2;

				while (end > start && parser.template.slice(end, end + 2) !== 'as') {
					end -= 1;
				}

				if (end <= start) throw err;

				// @ts-expect-error parser.template is meant to be readonly, this is a special case
				parser.template = template.slice(0, end);
			}
		}

		// @ts-expect-error
		parser.template = template;

		parser.allow_whitespace();

		// {#each} blocks must declare a context – {#each list as item}
		if (!parser.match('as')) {
			// this could be a TypeScript assertion that was erroneously eaten.

			if (expression.type === 'SequenceExpression') {
				expression = expression.expressions[0];
			}

			let assertion = null;
			let end = expression.end;

			expression = walk(expression, null, {
				// @ts-expect-error
				TSAsExpression(node, context) {
					if (node.end === /** @type {import('estree').Expression} */ (expression).end) {
						assertion = node;
						end = node.expression.end;
						return node.expression;
					}

					context.next();
				}
			});

			expression.end = end;

			if (assertion) {
				// we can't reset `parser.index` to `expression.expression.end` because
				// it will ignore any parentheses — we need to jump through this hoop
				let end = /** @type {any} */ (/** @type {any} */ (assertion).typeAnnotation).start - 2;
				while (parser.template.slice(end, end + 2) !== 'as') end -= 1;

				parser.index = end;
			}
		}
		parser.eat('as', true);
		parser.require_whitespace();

		const context = read_pattern(parser);

		parser.allow_whitespace();

		let index;
		let key;

		if (parser.eat(',')) {
			parser.allow_whitespace();
			index = parser.read_identifier();
			if (!index) {
				e.expected_identifier(parser.index);
			}

			parser.allow_whitespace();
		}

		if (parser.eat('(')) {
			parser.allow_whitespace();

			key = read_expression(parser);
			parser.allow_whitespace();
			parser.eat(')', true);
			parser.allow_whitespace();
		}

		parser.eat('}', true);

		/** @type {ReturnType<typeof parser.append<import('#compiler').EachBlock>>} */
		const block = parser.append({
			type: 'EachBlock',
			start,
			end: -1,
			expression,
			body: create_fragment(),
			context,
			index,
			key,
			metadata: /** @type {any} */ (null) // filled in later
		});

		parser.stack.push(block);
		parser.fragments.push(block.body);

		return;
	}

	if (parser.eat('await')) {
		parser.require_whitespace();
		const expression = read_expression(parser);
		parser.allow_whitespace();

		/** @type {ReturnType<typeof parser.append<import('#compiler').AwaitBlock>>} */
		const block = parser.append({
			type: 'AwaitBlock',
			start,
			end: -1,
			expression,
			value: null,
			error: null,
			pending: null,
			then: null,
			catch: null
		});

		if (parser.eat('then')) {
			if (parser.match_regex(regex_whitespace_with_closing_curly_brace)) {
				parser.allow_whitespace();
			} else {
				parser.require_whitespace();
				block.value = read_pattern(parser);
				parser.allow_whitespace();
			}

			block.then = create_fragment();
			parser.fragments.push(block.then);
		} else if (parser.eat('catch')) {
			if (parser.match_regex(regex_whitespace_with_closing_curly_brace)) {
				parser.allow_whitespace();
			} else {
				parser.require_whitespace();
				block.error = read_pattern(parser);
				parser.allow_whitespace();
			}

			block.catch = create_fragment();
			parser.fragments.push(block.catch);
		} else {
			block.pending = create_fragment();
			parser.fragments.push(block.pending);
		}

		parser.eat('}', true);
		parser.stack.push(block);

		return;
	}

	if (parser.eat('key')) {
		parser.require_whitespace();

		const expression = read_expression(parser);
		parser.allow_whitespace();

		parser.eat('}', true);

		/** @type {ReturnType<typeof parser.append<import('#compiler').KeyBlock>>} */
		const block = parser.append({
			type: 'KeyBlock',
			start,
			end: -1,
			expression,
			fragment: create_fragment()
		});

		parser.stack.push(block);
		parser.fragments.push(block.fragment);

		return;
	}

	if (parser.eat('snippet')) {
		parser.require_whitespace();

		const name_start = parser.index;
		const name = parser.read_identifier();
		const name_end = parser.index;

		if (name === null) {
			e.expected_identifier(parser.index);
		}

		parser.allow_whitespace();

		const params_start = parser.index;

		parser.eat('(', true);
		let parentheses = 1;

		while (parser.index < parser.template.length && (!parser.match(')') || parentheses !== 1)) {
			if (parser.match('(')) parentheses++;
			if (parser.match(')')) parentheses--;
			parser.index += 1;
		}

		parser.eat(')', true);

		const prelude = parser.template.slice(0, params_start).replace(/\S/g, ' ');
		const params = parser.template.slice(params_start, parser.index);

		let function_expression = /** @type {import('estree').ArrowFunctionExpression} */ (
			parse_expression_at(prelude + `${params} => {}`, parser.ts, params_start)
		);

		parser.allow_whitespace();
		parser.eat('}', true);

		/** @type {ReturnType<typeof parser.append<import('#compiler').SnippetBlock>>} */
		const block = parser.append({
			type: 'SnippetBlock',
			start,
			end: -1,
			expression: {
				type: 'Identifier',
				start: name_start,
				end: name_end,
				name
			},
			parameters: function_expression.params,
			body: create_fragment()
		});
		parser.stack.push(block);
		parser.fragments.push(block.body);

		return;
	}

	e.expected_block_type(parser.index);
}

/** @param {import('../index.js').Parser} parser */
function next(parser) {
	const start = parser.index - 1;

	const block = parser.current(); // TODO type should not be TemplateNode, that's much too broad

	if (block.type === 'IfBlock') {
		if (!parser.eat('else')) e.expected_token(start, '{:else} or {:else if}');
		if (parser.eat('if')) e.block_invalid_elseif(start);

		parser.allow_whitespace();

		parser.fragments.pop();

		block.alternate = create_fragment();
		parser.fragments.push(block.alternate);

		// :else if
		if (parser.eat('if')) {
			parser.require_whitespace();

			const expression = read_expression(parser);

			parser.allow_whitespace();
			parser.eat('}', true);

			let elseif_start = start - 1;
			while (parser.template[elseif_start] !== '{') elseif_start -= 1;

			/** @type {ReturnType<typeof parser.append<import('#compiler').IfBlock>>} */
			const child = parser.append({
				start: elseif_start,
				end: -1,
				type: 'IfBlock',
				elseif: true,
				test: expression,
				consequent: create_fragment(),
				alternate: null
			});

			parser.stack.push(child);
			parser.fragments.pop();
			parser.fragments.push(child.consequent);
		} else {
			// :else
			parser.allow_whitespace();
			parser.eat('}', true);
		}

		return;
	}

	if (block.type === 'EachBlock') {
		if (!parser.eat('else')) e.expected_token(start, '{:else}');

		parser.allow_whitespace();
		parser.eat('}', true);

		block.fallback = create_fragment();

		parser.fragments.pop();
		parser.fragments.push(block.fallback);

		return;
	}

	if (block.type === 'AwaitBlock') {
		if (parser.eat('then')) {
			if (block.then) {
				e.block_duplicate_clause(start, '{:then}');
			}

			if (!parser.eat('}')) {
				parser.require_whitespace();
				block.value = read_pattern(parser);
				parser.allow_whitespace();
				parser.eat('}', true);
			}

			block.then = create_fragment();
			parser.fragments.pop();
			parser.fragments.push(block.then);

			return;
		}

		if (parser.eat('catch')) {
			if (block.catch) {
				e.block_duplicate_clause(start, '{:catch}');
			}

			if (!parser.eat('}')) {
				parser.require_whitespace();
				block.error = read_pattern(parser);
				parser.allow_whitespace();
				parser.eat('}', true);
			}

			block.catch = create_fragment();
			parser.fragments.pop();
			parser.fragments.push(block.catch);

			return;
		}

		e.expected_token(start, '{:then ...} or {:catch ...}');
	}

	e.block_invalid_continuation_placement(start);
}

/** @param {import('../index.js').Parser} parser */
function close(parser) {
	const start = parser.index - 1;

	let block = parser.current();

	switch (block.type) {
		case 'IfBlock':
			parser.eat('if', true);
			parser.allow_whitespace();
			parser.eat('}', true);
			while (block.elseif) {
				block.end = parser.index;
				parser.stack.pop();
				block = /** @type {import('#compiler').IfBlock} */ (parser.current());
			}
			block.end = parser.index;
			parser.pop();
			return;

		case 'EachBlock':
			parser.eat('each', true);
			break;
		case 'KeyBlock':
			parser.eat('key', true);
			break;
		case 'AwaitBlock':
			parser.eat('await', true);
			break;
		case 'SnippetBlock':
			parser.eat('snippet', true);
			break;

		case 'RegularElement':
			// TODO handle implicitly closed elements
			e.block_unexpected_close(start);
			break;

		default:
			e.block_unexpected_close(start);
	}

	parser.allow_whitespace();
	parser.eat('}', true);
	block.end = parser.index;
	parser.pop();
}

/** @param {import('../index.js').Parser} parser */
function special(parser) {
	let start = parser.index;
	while (parser.template[start] !== '{') start -= 1;

	if (parser.eat('html')) {
		// {@html content} tag
		parser.require_whitespace();

		const expression = read_expression(parser);

		parser.allow_whitespace();
		parser.eat('}', true);

		/** @type {ReturnType<typeof parser.append<import('#compiler').HtmlTag>>} */
		parser.append({
			type: 'HtmlTag',
			start,
			end: parser.index,
			expression
		});

		return;
	}

	if (parser.eat('debug')) {
		/** @type {import('estree').Identifier[]} */
		let identifiers;

		// Implies {@debug} which indicates "debug all"
		if (parser.read(regex_whitespace_with_closing_curly_brace)) {
			identifiers = [];
		} else {
			const expression = read_expression(parser);

			identifiers =
				expression.type === 'SequenceExpression'
					? /** @type {import('estree').Identifier[]} */ (expression.expressions)
					: [/** @type {import('estree').Identifier} */ (expression)];

			identifiers.forEach(
				/** @param {any} node */ (node) => {
					if (node.type !== 'Identifier') {
						e.debug_tag_invalid_arguments(/** @type {number} */ (node.start));
					}
				}
			);

			parser.allow_whitespace();
			parser.eat('}', true);
		}

		/** @type {ReturnType<typeof parser.append<import('#compiler').DebugTag>>} */
		parser.append({
			type: 'DebugTag',
			start,
			end: parser.index,
			identifiers
		});

		return;
	}

	if (parser.eat('const')) {
		parser.require_whitespace();

		const id = read_pattern(parser);
		parser.allow_whitespace();

		parser.eat('=', true);
		parser.allow_whitespace();

		const expression_start = parser.index;
		const init = read_expression(parser);
		if (
			init.type === 'SequenceExpression' &&
			!parser.template.substring(expression_start, init.start).includes('(')
		) {
			// const a = (b, c) is allowed but a = b, c = d is not;
			e.const_tag_invalid_expression(init);
		}
		parser.allow_whitespace();

		parser.eat('}', true);

		/** @type {ReturnType<typeof parser.append<import('#compiler').ConstTag>>} */
		parser.append({
			type: 'ConstTag',
			start,
			end: parser.index,
			declaration: {
				type: 'VariableDeclaration',
				kind: 'const',
				declarations: [{ type: 'VariableDeclarator', id, init, start: id.start, end: init.end }],
				start: start + 2, // start at const, not at @const
				end: parser.index - 1
			}
		});
	}

	if (parser.eat('render')) {
		// {@render foo(...)}
		parser.require_whitespace();

		const expression = read_expression(parser);

		if (
			expression.type !== 'CallExpression' &&
			(expression.type !== 'ChainExpression' || expression.expression.type !== 'CallExpression')
		) {
			e.render_tag_invalid_expression(expression);
		}

		parser.allow_whitespace();
		parser.eat('}', true);

		/** @type {ReturnType<typeof parser.append<import('#compiler').RenderTag>>} */
		parser.append({
			type: 'RenderTag',
			start,
			end: parser.index,
			expression: expression,
			metadata: {
				dynamic: false
			}
		});
	}
}
