/** @import { ArrowFunctionExpression, Expression, Identifier, Pattern, VariableDeclaration } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { Parser } from '../index.js' */
import { walk } from 'zimmerframe';
import * as e from '../../../errors.js';
import { create_fragment, ExpressionMetadata } from '../../nodes.js';
import { parse_expression_at, parse_statement_at } from '../acorn.js';
import read_pattern from '../read/context.js';
import read_expression, { get_loose_identifier } from '../read/expression.js';
import { find_matching_bracket, match_bracket } from '../utils/bracket.js';

const regex_whitespace_with_closing_curly_brace = /\s*}/y;
const regex_supported_declaration = /(?:let|const)\b/y;
const regex_unsupported_declaration = /(?:var|interface|enum)\b/y;
// `type` is a contextual keyword; this is just a shape hint, confirmed by parsing.
const regex_maybe_type_declaration = /type\b/y;

const pointy_bois = { '<': '>' };

/**
 * Heuristic check for whether the given snippet parameter list (e.g. `(text: string)`)
 * looks like it contains TypeScript type annotations. Used to augment the parse error
 * with a hint about `lang="ts"` when parsing the parameters as JavaScript fails.
 * Conservative by design: string literals and comments are skipped, colons inside
 * `{}` or `[]` (e.g. object destructuring or object literals) don't count, and
 * ternaries don't count as annotations.
 * @param {string} params
 */
function looks_like_type_annotation(params) {
	let curly = 0;
	let square = 0;
	let i = 0;

	while (i < params.length) {
		const char = params[i];

		// skip string literals
		if (char === '"' || char === "'" || char === '`') {
			i += 1;
			while (i < params.length && params[i] !== char) {
				i += params[i] === '\\' ? 2 : 1;
			}
			i += 1;
			continue;
		}

		// skip comments
		if (char === '/' && params[i + 1] === '/') {
			while (i < params.length && params[i] !== '\n') i += 1;
			continue;
		}

		if (char === '/' && params[i + 1] === '*') {
			i += 2;
			while (i < params.length && !(params[i] === '*' && params[i + 1] === '/')) i += 1;
			i += 2;
			continue;
		}

		if (char === '{') curly += 1;
		else if (char === '}') curly -= 1;
		else if (char === '[') square += 1;
		else if (char === ']') square -= 1;
		else if (char === ':' && curly === 0 && square === 0 && is_annotation_colon(params, i)) {
			return true;
		}

		i += 1;
	}

	return false;
}

/**
 * Checks whether the colon at the given index plausibly separates a parameter
 * name from a type annotation, as opposed to e.g. belonging to a ternary.
 * @param {string} params
 * @param {number} index
 */
function is_annotation_colon(params, index) {
	// the token before the colon should look like the end of a parameter name:
	// an identifier, `?` (optional parameter) or a closing bracket (destructured parameter)
	let j = index - 1;
	while (j >= 0 && /\s/.test(params[j])) j -= 1;
	const prev = params[j];
	if (prev === undefined || !/[\w$?)\]}]/.test(prev)) return false;

	// walk backwards to the start of this segment (`(`, `,`, `=` or the start),
	// skipping over balanced bracket pairs. A `?` at this level that is neither
	// an optional parameter marker nor part of `??` means the colon belongs to a ternary
	let k = j;
	let depth = 0;
	while (k >= 0) {
		const char = params[k];

		if (char === ')' || char === ']' || char === '}') {
			depth += 1;
		} else if (char === '(' || char === '[' || char === '{') {
			if (depth === 0) break;
			depth -= 1;
		} else if (depth === 0) {
			if (char === ',' || char === '=' || char === ';') break;

			if (char === '?') {
				if (params[k + 1] === '?') {
					k -= 1; // skip the second `?` of `??`
				} else {
					let m = k + 1;
					while (m < params.length && /\s/.test(params[m])) m += 1;
					if (params[m] !== ':') return false; // ternary
				}
			}
		}

		k -= 1;
	}

	return true;
}

/** @param {Parser} parser */
export default function tag(parser) {
	const start = parser.index;
	parser.index += 1;

	parser.allow_whitespace();

	if (parser.eat('#')) return open(parser);
	if (parser.eat(':')) return next(parser);
	if (parser.eat('@')) return special(parser);
	if (parser.match('/')) {
		if (!parser.match('/*') && !parser.match('//')) {
			parser.eat('/');
			return close(parser);
		}
	}

	const declaration = read_declaration(parser);
	if (declaration) {
		parser.append({
			type: 'DeclarationTag',
			start,
			end: parser.index,
			declaration: /** @type {VariableDeclaration} */ (declaration),
			metadata: {
				expression: new ExpressionMetadata()
			}
		});
		return;
	}

	const expression = read_expression(parser);

	parser.allow_whitespace();
	parser.eat('}', true);

	parser.append({
		type: 'ExpressionTag',
		start,
		end: parser.index,
		expression,
		metadata: {
			expression: new ExpressionMetadata()
		}
	});
}

/**
 * @param {Parser} parser
 * @returns {null | import('estree').VariableDeclaration}
 */
function read_declaration(parser) {
	const start = parser.index;

	const unsupported = parser.match_regex(regex_unsupported_declaration);
	if (unsupported) {
		e.declaration_tag_invalid_type({ start, end: start + unsupported.length });
	}

	if (
		!parser.match_regex(regex_supported_declaration) &&
		// `type` is special, since it is not a reserved keyword and can be used
		// as part of a valid expression. We gotta parse first and then see what it is.
		!parser.match_regex(regex_maybe_type_declaration)
	) {
		return null;
	}

	const initial_comment_count = parser.root.comments.length;

	/** @type {import('estree').Statement | import('estree').VariableDeclaration} */
	let declaration;
	try {
		declaration = parse_statement_at(parser, parser.template, start);
	} catch (error) {
		if (!parser.loose) throw error;

		const end = find_matching_bracket(parser.template, start, '{');
		if (end === undefined) throw error;

		parser.index = end;
		const kind = parser.template.startsWith('const', start) ? 'const' : 'let';

		declaration = {
			type: 'VariableDeclaration',
			kind,
			declarations: [
				{
					type: 'VariableDeclarator',
					id: {
						type: 'Identifier',
						name: '',
						start: parser.index,
						end: parser.index
					},
					init: null,
					start: parser.index,
					end: parser.index
				}
			],
			start,
			end
		};
	}

	if (declaration.type !== 'VariableDeclaration') {
		if (declaration.type === 'ExpressionStatement') {
			parser.root.comments.length = initial_comment_count; // Else they show up duplicated
			return null;
		} else {
			// This is a TSTypeAliasDeclaration
			e.declaration_tag_invalid_type({
				start: declaration.start ?? start,
				end: declaration.end ?? parser.index
			});
		}
	}

	// TODO support using
	if (declaration.kind !== 'let' && declaration.kind !== 'const') {
		e.declaration_tag_invalid_type(declaration);
	}

	parser.index = /** @type {number} */ (declaration.end);
	parser.allow_whitespace();
	parser.eat('}', true);

	return declaration;
}

/** @param {Parser} parser */
function open(parser) {
	let start = parser.index - 2;
	while (parser.template[start] !== '{') start -= 1;

	if (parser.eat('if')) {
		parser.require_whitespace();

		/** @type {AST.IfBlock} */
		const block = parser.append({
			type: 'IfBlock',
			elseif: false,
			start,
			end: -1,
			test: read_expression(parser),
			consequent: create_fragment(),
			alternate: null,
			metadata: {
				expression: new ExpressionMetadata()
			}
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

		/** @type {Expression | undefined} */
		let expression;

		// we have to do this loop because `{#each x as { y = z }}` fails to parse —
		// the `as { y = z }` is treated as an Expression but it's actually a Pattern.
		// the 'fix' is to backtrack and hide everything from the `as` onwards, until
		// we get a valid expression
		while (!expression) {
			try {
				expression = read_expression(parser, undefined, true);
			} catch (err) {
				end = /** @type {any} */ (err).position[0] - 2;

				while (end > start && parser.template.slice(end, end + 2) !== 'as') {
					end -= 1;
				}

				if (end <= start) {
					if (parser.loose) {
						expression = get_loose_identifier(parser);
						if (expression) {
							break;
						}
					}
					throw err;
				}

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
					if (node.end === /** @type {Expression} */ (expression).end) {
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

		/** @type {Pattern | null} */
		let context = null;
		let index;
		let key;

		if (parser.eat('as')) {
			parser.require_whitespace();

			context = read_pattern(parser);
		} else {
			// {#each Array.from({ length: 10 }), i} is read as a sequence expression,
			// which is set back above - we now gotta reset the index as a consequence
			// to properly read the , i part
			parser.index = /** @type {number} */ (expression.end);
		}

		parser.allow_whitespace();

		if (parser.eat(',')) {
			parser.allow_whitespace();
			index = parser.read_identifier().name;
			if (!index) {
				e.expected_identifier(parser.index);
			}

			parser.allow_whitespace();
		}

		if (parser.eat('(')) {
			parser.allow_whitespace();

			key = read_expression(parser, '(');
			parser.allow_whitespace();
			parser.eat(')', true);
			parser.allow_whitespace();
		}

		const matches = parser.eat('}', true, false);

		if (!matches) {
			// Parser may have read the `as` as part of the expression (e.g. in `{#each foo. as x}`)
			if (parser.template.slice(parser.index - 4, parser.index) === ' as ') {
				const prev_index = parser.index;
				context = read_pattern(parser);
				parser.eat('}', true);
				expression = {
					type: 'Identifier',
					name: '',
					start: expression.start,
					end: prev_index - 4
				};
			} else {
				parser.eat('}', true); // rerun to produce the parser error
			}
		}

		/** @type {AST.EachBlock} */
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

		/** @type {AST.AwaitBlock} */
		const block = parser.append({
			type: 'AwaitBlock',
			start,
			end: -1,
			expression,
			value: null,
			error: null,
			pending: null,
			then: null,
			catch: null,
			metadata: {
				expression: new ExpressionMetadata()
			}
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

		const matches = parser.eat('}', true, false);

		// Parser may have read the `then/catch` as part of the expression (e.g. in `{#await foo. then x}`)
		if (!matches) {
			if (parser.template.slice(parser.index - 6, parser.index) === ' then ') {
				const prev_index = parser.index;
				block.value = read_pattern(parser);
				parser.eat('}', true);
				block.expression = {
					type: 'Identifier',
					name: '',
					start: expression.start,
					end: prev_index - 6
				};
				block.then = block.pending;
				block.pending = null;
			} else if (parser.template.slice(parser.index - 7, parser.index) === ' catch ') {
				const prev_index = parser.index;
				block.error = read_pattern(parser);
				parser.eat('}', true);
				block.expression = {
					type: 'Identifier',
					name: '',
					start: expression.start,
					end: prev_index - 7
				};
				block.catch = block.pending;
				block.pending = null;
			} else {
				parser.eat('}', true); // rerun to produce the parser error
			}
		}

		parser.stack.push(block);

		return;
	}

	if (parser.eat('key')) {
		parser.require_whitespace();

		const expression = read_expression(parser);
		parser.allow_whitespace();

		parser.eat('}', true);

		/** @type {AST.KeyBlock} */
		const block = parser.append({
			type: 'KeyBlock',
			start,
			end: -1,
			expression,
			fragment: create_fragment(),
			metadata: {
				expression: new ExpressionMetadata()
			}
		});

		parser.stack.push(block);
		parser.fragments.push(block.fragment);

		return;
	}

	if (parser.eat('snippet')) {
		parser.require_whitespace();

		const id = parser.read_identifier();

		if (id.name === '' && !parser.loose) {
			e.expected_identifier(parser.index);
		}

		parser.allow_whitespace();

		const params_start = parser.index;

		// snippets could have a generic signature, e.g. `#snippet foo<T>(...)`
		/** @type {string | undefined} */
		let type_params;

		// if we match a generic opening
		if (parser.ts && parser.match('<')) {
			const start = parser.index;
			const end = match_bracket(parser, start, pointy_bois);

			type_params = parser.template.slice(start + 1, end - 1);

			parser.index = end;
		}

		parser.allow_whitespace();

		const matched = parser.eat('(', true, false);

		if (matched) {
			let parentheses = 1;

			while (parser.index < parser.template.length && (!parser.match(')') || parentheses !== 1)) {
				if (parser.match('(')) parentheses++;
				if (parser.match(')')) parentheses--;
				parser.index += 1;
			}

			parser.eat(')', true);
		}

		let function_expression = { params: [] };

		if (matched) {
			// the parameters as written in the template, e.g. `(text: string)`
			const params = parser.template.slice(params_start, parser.index);

			try {
				function_expression = /** @type {ArrowFunctionExpression} */ (
					parse_expression_at(
						parser,
						parser.template.slice(0, parser.index) + ' => {}',
						params_start
					)
				);
			} catch (caught) {
				const error = /** @type {any} */ (caught);
				// parsing the parameters as JavaScript failed — if they look like they contain
				// TypeScript type annotations, the user probably forgot `lang="ts"`
				if (!parser.ts && error?.code === 'js_parse_error' && looks_like_type_annotation(params)) {
					const message = error.message.replace(
						/\nhttps:\/\/svelte\.dev\/e\/js_parse_error$/,
						`\nDid you forget to add \`lang="ts"\` to your \`<script>\` tag?`
					);
					e.js_parse_error(error.position?.[0] ?? params_start, message);
				}

				throw error;
			}
		}

		parser.allow_whitespace();
		parser.eat('}', true);

		/** @type {AST.SnippetBlock} */
		const block = parser.append({
			type: 'SnippetBlock',
			start,
			end: -1,
			expression: id,
			typeParams: type_params,
			parameters: function_expression.params,
			body: create_fragment(),
			metadata: {
				can_hoist: false,
				sites: new Set()
			}
		});
		parser.stack.push(block);
		parser.fragments.push(block.body);

		return;
	}

	e.expected_block_type(parser.index);
}

/** @param {Parser} parser */
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

			/** @type {AST.IfBlock} */
			const child = parser.append({
				start: elseif_start,
				end: -1,
				type: 'IfBlock',
				elseif: true,
				test: expression,
				consequent: create_fragment(),
				alternate: null,
				metadata: {
					expression: new ExpressionMetadata()
				}
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

/** @param {Parser} parser */
function close(parser) {
	const start = parser.index - 1;

	let block = parser.current();
	/** Only relevant/reached for loose parsing mode */
	let matched;

	switch (block.type) {
		case 'IfBlock':
			matched = parser.eat('if', true, false);

			if (!matched) {
				block.end = start - 1;
				parser.pop();
				close(parser);
				return;
			}

			parser.allow_whitespace();
			parser.eat('}', true);

			while (block.elseif) {
				block.end = parser.index;
				parser.stack.pop();
				block = /** @type {AST.IfBlock} */ (parser.current());
			}

			block.end = parser.index;
			parser.pop();
			return;

		case 'EachBlock':
			matched = parser.eat('each', true, false);
			break;
		case 'KeyBlock':
			matched = parser.eat('key', true, false);
			break;
		case 'AwaitBlock':
			matched = parser.eat('await', true, false);
			break;
		case 'SnippetBlock':
			matched = parser.eat('snippet', true, false);
			break;

		case 'RegularElement':
			if (parser.loose) {
				matched = false;
			} else {
				// TODO handle implicitly closed elements
				e.block_unexpected_close(start);
			}
			break;

		default:
			e.block_unexpected_close(start);
	}

	if (!matched) {
		block.end = start - 1;
		parser.pop();
		close(parser);
		return;
	}

	parser.allow_whitespace();
	parser.eat('}', true);
	block.end = parser.index;
	parser.pop();
}

/** @param {Parser} parser */
function special(parser) {
	let start = parser.index;
	while (parser.template[start] !== '{') start -= 1;

	if (parser.eat('html')) {
		// {@html content} tag
		parser.require_whitespace();

		const expression = read_expression(parser);

		parser.allow_whitespace();
		parser.eat('}', true);

		parser.append({
			type: 'HtmlTag',
			start,
			end: parser.index,
			expression,
			metadata: {
				expression: new ExpressionMetadata()
			}
		});

		return;
	}

	if (parser.eat('debug')) {
		/** @type {Identifier[]} */
		let identifiers;

		// Implies {@debug} which indicates "debug all"
		if (parser.read(regex_whitespace_with_closing_curly_brace)) {
			identifiers = [];
		} else {
			const expression = read_expression(parser);

			identifiers =
				expression.type === 'SequenceExpression'
					? /** @type {Identifier[]} */ (expression.expressions)
					: [/** @type {Identifier} */ (expression)];

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
		// parser is past wrapping parens, but `init.end` is not — use the parser position
		const declarator_end = parser.index;
		if (
			init.type === 'SequenceExpression' &&
			!parser.template.substring(expression_start, init.start).includes('(')
		) {
			// const a = (b, c) is allowed but a = b, c = d is not;
			e.const_tag_invalid_expression(init);
		}
		parser.allow_whitespace();

		parser.eat('}', true);

		parser.append({
			type: 'ConstTag',
			start,
			end: parser.index,
			declaration: {
				type: 'VariableDeclaration',
				kind: 'const',
				declarations: [
					{ type: 'VariableDeclarator', id, init, start: id.start, end: declarator_end }
				],
				start: start + 2, // start at const, not at @const
				end: parser.index - 1
			},
			metadata: {
				expression: new ExpressionMetadata()
			}
		});
		return;
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

		parser.append({
			type: 'RenderTag',
			start,
			end: parser.index,
			expression: /** @type {AST.RenderTag['expression']} */ (expression),
			metadata: {
				expression: new ExpressionMetadata(),
				dynamic: false,
				arguments: [],
				path: [],
				snippets: new Set()
			}
		});
		return;
	}
	e.expected_tag(parser.index);
}
