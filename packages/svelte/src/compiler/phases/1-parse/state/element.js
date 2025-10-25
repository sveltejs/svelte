/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { Parser } from '../index.js' */
import { is_void } from '../../../../utils.js';
import read_expression from '../read/expression.js';
import { read_script } from '../read/script.js';
import read_style from '../read/style.js';
import { decode_character_references } from '../utils/html.js';
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';
import { create_fragment } from '../utils/create.js';
import { create_attribute, ExpressionMetadata, is_element_node } from '../../nodes.js';
import { get_attribute_expression, is_expression_attribute } from '../../../utils/ast.js';
import { closing_tag_omitted } from '../../../../html-tree-validation.js';
import { list } from '../../../utils/string.js';

const regex_invalid_unquoted_attribute_value = /^(\/>|[\s"'=<>`])/;
const regex_closing_textarea_tag = /^<\/textarea(\s[^>]*)?>/i;
const regex_closing_comment = /-->/;
const regex_whitespace_or_slash_or_closing_tag = /(\s|\/|>)/;
const regex_token_ending_character = /[\s=/>"']/;
const regex_starts_with_quote_characters = /^["']/;
const regex_attribute_value = /^(?:"([^"]*)"|'([^'])*'|([^>\s]+))/;
const regex_valid_element_name =
	/^(?:![a-zA-Z]+|[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|[a-zA-Z][a-zA-Z0-9]*:[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9])$/;
export const regex_valid_component_name =
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers adjusted for our needs
	// (must start with uppercase letter if no dots, can contain dots)
	/^(?:\p{Lu}[$\u200c\u200d\p{ID_Continue}.]*|\p{ID_Start}[$\u200c\u200d\p{ID_Continue}]*(?:\.[$\u200c\u200d\p{ID_Continue}]+)+)$/u;

/** @type {Map<string, AST.ElementLike['type']>} */
const root_only_meta_tags = new Map([
	['svelte:head', 'SvelteHead'],
	['svelte:options', 'SvelteOptions'],
	['svelte:window', 'SvelteWindow'],
	['svelte:document', 'SvelteDocument'],
	['svelte:body', 'SvelteBody']
]);

/** @type {Map<string, AST.ElementLike['type']>} */
const meta_tags = new Map([
	...root_only_meta_tags,
	['svelte:element', 'SvelteElement'],
	['svelte:component', 'SvelteComponent'],
	['svelte:self', 'SvelteSelf'],
	['svelte:fragment', 'SvelteFragment'],
	['svelte:boundary', 'SvelteBoundary']
]);

/** @param {Parser} parser */
export default function element(parser) {
	const start = parser.index++;

	let parent = parser.current();

	if (parser.eat('!--')) {
		const data = parser.read_until(regex_closing_comment);
		parser.eat('-->', true);

		parser.append({
			type: 'Comment',
			start,
			end: parser.index,
			data
		});

		return;
	}

	const is_closing_tag = parser.eat('/');
	const name = parser.read_until(regex_whitespace_or_slash_or_closing_tag);

	if (is_closing_tag) {
		parser.allow_whitespace();
		parser.eat('>', true);

		if (is_void(name)) {
			e.void_element_invalid_content(start);
		}

		// close any elements that don't have their own closing tags, e.g. <div><p></div>
		while (/** @type {AST.RegularElement} */ (parent).name !== name) {
			if (parser.loose) {
				// If the previous element did interpret the next opening tag as an attribute, backtrack
				if (is_element_node(parent)) {
					const last = parent.attributes.at(-1);
					if (last?.type === 'Attribute' && last.name === `<${name}`) {
						parser.index = last.start;
						parent.attributes.pop();
						break;
					}
				}
			}

			if (parent.type === 'RegularElement') {
				if (!parser.last_auto_closed_tag || parser.last_auto_closed_tag.tag !== name) {
					const end = parent.fragment.nodes[0]?.start ?? start;
					w.element_implicitly_closed(
						{ start: parent.start, end },
						`</${name}>`,
						`</${parent.name}>`
					);
				}
			} else if (!parser.loose) {
				if (parser.last_auto_closed_tag && parser.last_auto_closed_tag.tag === name) {
					e.element_invalid_closing_tag_autoclosed(start, name, parser.last_auto_closed_tag.reason);
				} else {
					e.element_invalid_closing_tag(start, name);
				}
			}

			parent.end = start;
			parser.pop();

			parent = parser.current();
		}

		parent.end = parser.index;
		parser.pop();

		if (parser.last_auto_closed_tag && parser.stack.length < parser.last_auto_closed_tag.depth) {
			parser.last_auto_closed_tag = undefined;
		}

		return;
	}

	if (name.startsWith('svelte:') && !meta_tags.has(name)) {
		const bounds = { start: start + 1, end: start + 1 + name.length };
		e.svelte_meta_invalid_tag(bounds, list(Array.from(meta_tags.keys())));
	}

	if (!regex_valid_element_name.test(name) && !regex_valid_component_name.test(name)) {
		// <div. -> in the middle of typing -> allow in loose mode
		if (!parser.loose || !name.endsWith('.')) {
			const bounds = { start: start + 1, end: start + 1 + name.length };
			e.tag_invalid_name(bounds);
		}
	}

	if (root_only_meta_tags.has(name)) {
		if (name in parser.meta_tags) {
			e.svelte_meta_duplicate(start, name);
		}

		if (parent.type !== 'Root') {
			e.svelte_meta_invalid_placement(start, name);
		}

		parser.meta_tags[name] = true;
	}

	const type = meta_tags.has(name)
		? meta_tags.get(name)
		: regex_valid_component_name.test(name) || (parser.loose && name.endsWith('.'))
			? 'Component'
			: name === 'title' && parent_is_head(parser.stack)
				? 'TitleElement'
				: // TODO Svelte 6/7: once slots are removed in favor of snippets, always keep slot as a regular element
					name === 'slot' && !parent_is_shadowroot_template(parser.stack)
					? 'SlotElement'
					: 'RegularElement';

	/** @type {AST.ElementLike} */
	const element =
		type === 'RegularElement'
			? {
					type,
					start,
					end: -1,
					name,
					attributes: [],
					fragment: create_fragment(true),
					metadata: {
						svg: false,
						mathml: false,
						scoped: false,
						has_spread: false,
						path: [],
						synthetic_value_node: null
					}
				}
			: /** @type {AST.ElementLike} */ ({
					type,
					start,
					end: -1,
					name,
					attributes: [],
					fragment: create_fragment(true),
					metadata: {
						// unpopulated at first, differs between types
					}
				});

	parser.allow_whitespace();

	if (parent.type === 'RegularElement' && closing_tag_omitted(parent.name, name)) {
		const end = parent.fragment.nodes[0]?.start ?? start;
		w.element_implicitly_closed({ start: parent.start, end }, `<${name}>`, `</${parent.name}>`);
		parent.end = start;
		parser.pop();
		parser.last_auto_closed_tag = {
			tag: parent.name,
			reason: name,
			depth: parser.stack.length
		};
	}

	/** @type {string[]} */
	const unique_names = [];

	const current = parser.current();
	const is_top_level_script_or_style =
		(name === 'script' || name === 'style') && current.type === 'Root';

	const read = is_top_level_script_or_style ? read_static_attribute : read_attribute;

	let attribute;
	while ((attribute = read(parser))) {
		// animate and transition can only be specified once per element so no need
		// to check here, use can be used multiple times, same for the on directive
		// finally let already has error handling in case of duplicate variable names
		if (
			attribute.type === 'Attribute' ||
			attribute.type === 'BindDirective' ||
			attribute.type === 'StyleDirective' ||
			attribute.type === 'ClassDirective'
		) {
			// `bind:attribute` and `attribute` are just the same but `class:attribute`,
			// `style:attribute` and `attribute` are different and should be allowed together
			// so we concatenate the type while normalizing the type for BindDirective
			const type = attribute.type === 'BindDirective' ? 'Attribute' : attribute.type;
			if (unique_names.includes(type + attribute.name)) {
				e.attribute_duplicate(attribute);
				// <svelte:element bind:this this=..> is allowed
			} else if (attribute.name !== 'this') {
				unique_names.push(type + attribute.name);
			}
		}

		element.attributes.push(attribute);
		parser.allow_whitespace();
	}

	if (element.type === 'SvelteComponent') {
		const index = element.attributes.findIndex(
			/** @param {any} attr */
			(attr) => attr.type === 'Attribute' && attr.name === 'this'
		);
		if (index === -1) {
			e.svelte_component_missing_this(start);
		}

		const definition = /** @type {AST.Attribute} */ (element.attributes.splice(index, 1)[0]);
		if (!is_expression_attribute(definition)) {
			e.svelte_component_invalid_this(definition.start);
		}

		element.expression = get_attribute_expression(definition);
	}

	if (element.type === 'SvelteElement') {
		const index = element.attributes.findIndex(
			/** @param {any} attr */
			(attr) => attr.type === 'Attribute' && attr.name === 'this'
		);
		if (index === -1) {
			e.svelte_element_missing_this(start);
		}

		const definition = /** @type {AST.Attribute} */ (element.attributes.splice(index, 1)[0]);

		if (definition.value === true) {
			e.svelte_element_missing_this(definition);
		}

		if (!is_expression_attribute(definition)) {
			w.svelte_element_invalid_this(definition);

			// note that this is wrong, in the case of e.g. `this="h{n}"` — it will result in `<h>`.
			// it would be much better to just error here, but we are preserving the existing buggy
			// Svelte 4 behaviour out of an overabundance of caution regarding breaking changes.
			// TODO in 6.0, error
			const chunk = /** @type {Array<AST.ExpressionTag | AST.Text>} */ (definition.value)[0];
			element.tag =
				chunk.type === 'Text'
					? {
							type: 'Literal',
							value: chunk.data,
							raw: `'${chunk.raw}'`,
							start: chunk.start,
							end: chunk.end
						}
					: chunk.expression;
		} else {
			element.tag = get_attribute_expression(definition);
		}

		element.metadata.expression = new ExpressionMetadata();
	}

	if (is_top_level_script_or_style) {
		parser.eat('>', true);

		/** @type {AST.Comment | null} */
		let prev_comment = null;
		for (let i = current.fragment.nodes.length - 1; i >= 0; i--) {
			const node = current.fragment.nodes[i];

			if (i === current.fragment.nodes.length - 1 && node.end !== start) {
				break;
			}

			if (node.type === 'Comment') {
				prev_comment = node;
				break;
			} else if (node.type !== 'Text' || node.data.trim()) {
				break;
			}
		}

		if (name === 'script') {
			const content = read_script(parser, start, element.attributes);
			if (prev_comment) {
				// We take advantage of the fact that the root will never have leadingComments set,
				// and set the previous comment to it so that the warning mechanism can later
				// inspect the root and see if there was a html comment before it silencing specific warnings.
				content.content.leadingComments = [{ type: 'Line', value: prev_comment.data }];
			}

			if (content.context === 'module') {
				if (current.module) e.script_duplicate(start);
				current.module = content;
			} else {
				if (current.instance) e.script_duplicate(start);
				current.instance = content;
			}
		} else {
			const content = read_style(parser, start, element.attributes);
			content.content.comment = prev_comment;

			if (current.css) e.style_duplicate(start);
			current.css = content;
		}
		return;
	}

	parser.append(element);

	const self_closing = parser.eat('/') || is_void(name);
	const closed = parser.eat('>', true, false);

	// Loose parsing mode
	if (!closed) {
		// We may have eaten an opening `<` of the next element and treated it as an attribute...
		const last = element.attributes.at(-1);
		if (last?.type === 'Attribute' && last.name === '<') {
			parser.index = last.start;
			element.attributes.pop();
		} else {
			// ... or we may have eaten part of a following block ...
			const prev_1 = parser.template[parser.index - 1];
			const prev_2 = parser.template[parser.index - 2];
			const current = parser.template[parser.index];
			if (prev_2 === '{' && prev_1 === '/') {
				parser.index -= 2;
			} else if (prev_1 === '{' && (current === '#' || current === '@' || current === ':')) {
				parser.index -= 1;
			} else {
				// ... or we're followed by whitespace, for example near the end of the template,
				// which we want to take in so that language tools has more room to work with
				parser.allow_whitespace();
			}
		}
	}

	if (self_closing || !closed) {
		// don't push self-closing elements onto the stack
		element.end = parser.index;
	} else if (name === 'textarea') {
		// special case
		element.fragment.nodes = read_sequence(
			parser,
			() => regex_closing_textarea_tag.test(parser.template.slice(parser.index)),
			'inside <textarea>'
		);
		parser.read(regex_closing_textarea_tag);
		element.end = parser.index;
	} else if (name === 'script' || name === 'style') {
		// special case
		const start = parser.index;
		const data = parser.read_until(new RegExp(`</${name}>`));
		const end = parser.index;

		/** @type {AST.Text} */
		const node = {
			start,
			end,
			type: 'Text',
			data,
			raw: data
		};

		element.fragment.nodes.push(node);
		parser.eat(`</${name}>`, true);
		element.end = parser.index;
	} else {
		parser.stack.push(element);
		parser.fragments.push(element.fragment);
	}
}

/** @param {AST.TemplateNode[]} stack */
function parent_is_head(stack) {
	let i = stack.length;
	while (i--) {
		const { type } = stack[i];
		if (type === 'SvelteHead') return true;
		if (type === 'RegularElement' || type === 'Component') return false;
	}
	return false;
}

/** @param {AST.TemplateNode[]} stack */
function parent_is_shadowroot_template(stack) {
	// https://developer.chrome.com/docs/css-ui/declarative-shadow-dom#building_a_declarative_shadow_root
	let i = stack.length;
	while (i--) {
		if (
			stack[i].type === 'RegularElement' &&
			/** @type {AST.RegularElement} */ (stack[i]).attributes.some(
				(a) => a.type === 'Attribute' && a.name === 'shadowrootmode'
			)
		) {
			return true;
		}
	}
	return false;
}

/**
 * @param {Parser} parser
 * @returns {AST.Attribute | null}
 */
function read_static_attribute(parser) {
	const start = parser.index;

	const name = parser.read_until(regex_token_ending_character);
	if (!name) return null;

	/** @type {true | Array<AST.Text | AST.ExpressionTag>} */
	let value = true;

	if (parser.eat('=')) {
		parser.allow_whitespace();
		let raw = parser.match_regex(regex_attribute_value);
		if (!raw) {
			e.expected_attribute_value(parser.index);
		}

		parser.index += raw.length;

		const quoted = raw[0] === '"' || raw[0] === "'";
		if (quoted) {
			raw = raw.slice(1, -1);
		}

		value = [
			{
				start: parser.index - raw.length - (quoted ? 1 : 0),
				end: quoted ? parser.index - 1 : parser.index,
				type: 'Text',
				raw: raw,
				data: decode_character_references(raw, true)
			}
		];
	}

	if (parser.match_regex(regex_starts_with_quote_characters)) {
		e.expected_token(parser.index, '=');
	}

	return create_attribute(name, start, parser.index, value);
}

/**
 * @param {Parser} parser
 * @returns {AST.Attribute | AST.SpreadAttribute | AST.Directive | AST.AttachTag | null}
 */
function read_attribute(parser) {
	const start = parser.index;

	if (parser.eat('{')) {
		parser.allow_whitespace();

		if (parser.eat('@attach')) {
			parser.require_whitespace();

			const expression = read_expression(parser);
			parser.allow_whitespace();
			parser.eat('}', true);

			/** @type {AST.AttachTag} */
			const attachment = {
				type: 'AttachTag',
				start,
				end: parser.index,
				expression,
				metadata: {
					expression: new ExpressionMetadata()
				}
			};

			return attachment;
		}

		if (parser.eat('...')) {
			const expression = read_expression(parser);

			parser.allow_whitespace();
			parser.eat('}', true);

			/** @type {AST.SpreadAttribute} */
			const spread = {
				type: 'SpreadAttribute',
				start,
				end: parser.index,
				expression,
				metadata: {
					expression: new ExpressionMetadata()
				}
			};

			return spread;
		} else {
			const value_start = parser.index;
			let name = parser.read_identifier();

			if (name === null) {
				if (
					parser.loose &&
					(parser.match('#') || parser.match('/') || parser.match('@') || parser.match(':'))
				) {
					// We're likely in an unclosed opening tag and did read part of a block.
					// Return null to not crash the parser so it can continue with closing the tag.
					return null;
				} else if (parser.loose && parser.match('}')) {
					// Likely in the middle of typing, just created the shorthand
					name = '';
				} else {
					e.attribute_empty_shorthand(start);
				}
			}

			parser.allow_whitespace();
			parser.eat('}', true);

			/** @type {AST.ExpressionTag} */
			const expression = {
				type: 'ExpressionTag',
				start: value_start,
				end: value_start + name.length,
				expression: {
					start: value_start,
					end: value_start + name.length,
					type: 'Identifier',
					name
				},
				metadata: {
					expression: new ExpressionMetadata()
				}
			};

			return create_attribute(name, start, parser.index, expression);
		}
	}

	const name = parser.read_until(regex_token_ending_character);
	if (!name) return null;

	let end = parser.index;

	parser.allow_whitespace();

	const colon_index = name.indexOf(':');
	const type = colon_index !== -1 && get_directive_type(name.slice(0, colon_index));

	/** @type {true | AST.ExpressionTag | Array<AST.Text | AST.ExpressionTag>} */
	let value = true;
	if (parser.eat('=')) {
		parser.allow_whitespace();

		if (parser.template[parser.index] === '/' && parser.template[parser.index + 1] === '>') {
			const char_start = parser.index;
			parser.index++; // consume '/'
			value = [
				{
					start: char_start,
					end: char_start + 1,
					type: 'Text',
					raw: '/',
					data: '/'
				}
			];
			end = parser.index;
		} else {
			value = read_attribute_value(parser);
			end = parser.index;
		}
	} else if (parser.match_regex(regex_starts_with_quote_characters)) {
		e.expected_token(parser.index, '=');
	}

	if (type) {
		const [directive_name, ...modifiers] = name.slice(colon_index + 1).split('|');

		if (directive_name === '') {
			e.directive_missing_name({ start, end: start + colon_index + 1 }, name);
		}

		if (type === 'StyleDirective') {
			return {
				start,
				end,
				type,
				name: directive_name,
				modifiers: /** @type {Array<'important'>} */ (modifiers),
				value,
				metadata: {
					expression: new ExpressionMetadata()
				}
			};
		}

		const first_value = value === true ? undefined : Array.isArray(value) ? value[0] : value;

		/** @type {Expression | null} */
		let expression = null;

		if (first_value) {
			const attribute_contains_text =
				/** @type {any[]} */ (value).length > 1 || first_value.type === 'Text';
			if (attribute_contains_text) {
				e.directive_invalid_value(/** @type {number} */ (first_value.start));
			} else {
				// TODO throw a parser error in a future version here if this `[ExpressionTag]` instead of `ExpressionTag`,
				// which means stringified value, which isn't allowed for some directives?
				expression = first_value.expression;
			}
		}

		/** @type {AST.Directive} */
		const directive = {
			start,
			end,
			type,
			name: directive_name,
			expression,
			metadata: {
				expression: new ExpressionMetadata()
			}
		};

		// @ts-expect-error we do this separately from the declaration to avoid upsetting typescript
		directive.modifiers = modifiers;

		if (directive.type === 'TransitionDirective') {
			const direction = name.slice(0, colon_index);
			directive.intro = direction === 'in' || direction === 'transition';
			directive.outro = direction === 'out' || direction === 'transition';
		}

		// Directive name is expression, e.g. <p class:isRed />
		if (
			(directive.type === 'BindDirective' || directive.type === 'ClassDirective') &&
			!directive.expression
		) {
			directive.expression = /** @type {any} */ ({
				start: start + colon_index + 1,
				end,
				type: 'Identifier',
				name: directive.name
			});
		}

		return directive;
	}

	return create_attribute(name, start, end, value);
}

/**
 * @param {string} name
 * @returns {any}
 */
function get_directive_type(name) {
	if (name === 'use') return 'UseDirective';
	if (name === 'animate') return 'AnimateDirective';
	if (name === 'bind') return 'BindDirective';
	if (name === 'class') return 'ClassDirective';
	if (name === 'style') return 'StyleDirective';
	if (name === 'on') return 'OnDirective';
	if (name === 'let') return 'LetDirective';
	if (name === 'in' || name === 'out' || name === 'transition') return 'TransitionDirective';
	return false;
}

/**
 * @param {Parser} parser
 * @return {AST.ExpressionTag | Array<AST.ExpressionTag | AST.Text>}
 */
function read_attribute_value(parser) {
	const quote_mark = parser.eat("'") ? "'" : parser.eat('"') ? '"' : null;
	if (quote_mark && parser.eat(quote_mark)) {
		return [
			{
				start: parser.index - 1,
				end: parser.index - 1,
				type: 'Text',
				raw: '',
				data: ''
			}
		];
	}

	/** @type {Array<AST.ExpressionTag | AST.Text>} */
	let value;
	try {
		value = read_sequence(
			parser,
			() => {
				// handle common case of quote marks existing outside of regex for performance reasons
				if (quote_mark) return parser.match(quote_mark);
				return !!parser.match_regex(regex_invalid_unquoted_attribute_value);
			},
			'in attribute value'
		);
	} catch (/** @type {any} */ error) {
		if (error.code === 'js_parse_error') {
			// if the attribute value didn't close + self-closing tag
			// eg: `<Component test={{a:1} />`
			// acorn may throw a `Unterminated regular expression` because of `/>`
			const pos = error.position?.[0];
			if (pos !== undefined && parser.template.slice(pos - 1, pos + 1) === '/>') {
				parser.index = pos;
				e.expected_token(pos, quote_mark || '}');
			}
		}
		throw error;
	}

	if (value.length === 0 && !quote_mark) {
		e.expected_attribute_value(parser.index);
	}

	if (quote_mark) parser.index += 1;

	if (quote_mark || value.length > 1 || value[0].type === 'Text') {
		return value;
	} else {
		return value[0];
	}
}

/**
 * @param {Parser} parser
 * @param {() => boolean} done
 * @param {string} location
 * @returns {any[]}
 */
function read_sequence(parser, done, location) {
	/** @type {AST.Text} */
	let current_chunk = {
		start: parser.index,
		end: -1,
		type: 'Text',
		raw: '',
		data: ''
	};

	/** @type {Array<AST.Text | AST.ExpressionTag>} */
	const chunks = [];

	/** @param {number} end */
	function flush(end) {
		if (current_chunk.raw) {
			current_chunk.data = decode_character_references(current_chunk.raw, true);
			current_chunk.end = end;
			chunks.push(current_chunk);
		}
	}

	while (parser.index < parser.template.length) {
		const index = parser.index;

		if (done()) {
			flush(parser.index);
			return chunks;
		} else if (parser.eat('{')) {
			if (parser.match('#')) {
				const index = parser.index - 1;
				parser.eat('#');
				const name = parser.read_until(/[^a-z]/);
				e.block_invalid_placement(index, name, location);
			} else if (parser.match('@')) {
				const index = parser.index - 1;
				parser.eat('@');
				const name = parser.read_until(/[^a-z]/);
				e.tag_invalid_placement(index, name, location);
			}

			flush(parser.index - 1);

			parser.allow_whitespace();
			const expression = read_expression(parser);
			parser.allow_whitespace();
			parser.eat('}', true);

			/** @type {AST.ExpressionTag} */
			const chunk = {
				type: 'ExpressionTag',
				start: index,
				end: parser.index,
				expression,
				metadata: {
					expression: new ExpressionMetadata()
				}
			};

			chunks.push(chunk);

			current_chunk = {
				start: parser.index,
				end: -1,
				type: 'Text',
				raw: '',
				data: ''
			};
		} else {
			current_chunk.raw += parser.template[parser.index++];
		}
	}

	if (parser.loose) {
		return chunks;
	} else {
		e.unexpected_eof(parser.template.length);
	}
}
