import { extract_svelte_ignore } from '../../../utils/extract_svelte_ignore.js';
import fuzzymatch from '../utils/fuzzymatch.js';
import { is_void } from '../utils/names.js';
import read_expression from '../read/expression.js';
import { read_script } from '../read/script.js';
import read_style from '../read/style.js';
import { closing_tag_omitted, decode_character_references } from '../utils/html.js';
import { error } from '../../../errors.js';
import { create_fragment } from '../utils/create.js';
import { create_attribute } from '../../nodes.js';

// eslint-disable-next-line no-useless-escape
const valid_tag_name = /^\!?[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;

/** Invalid attribute characters if the attribute is not surrounded by quotes */
const regex_starts_with_invalid_attr_value = /^(\/>|[\s"'=<>`])/;

/** @type {Map<string, import('#compiler').SvelteNode['type']>} */
const root_only_meta_tags = new Map([
	['svelte:head', 'SvelteHead'],
	['svelte:options', 'SvelteOptions'],
	['svelte:window', 'SvelteWindow'],
	['svelte:document', 'SvelteDocument'],
	['svelte:body', 'SvelteBody']
]);

/** @type {Map<string, import('#compiler').SvelteNode['type']>} */
const meta_tags = new Map([
	...root_only_meta_tags,
	['svelte:element', 'SvelteElement'],
	['svelte:component', 'SvelteComponent'],
	['svelte:self', 'SvelteSelf'],
	['svelte:fragment', 'SvelteFragment']
]);

const valid_meta_tags = Array.from(meta_tags.keys());

const SELF = /^svelte:self(?=[\s/>])/;
const COMPONENT = /^svelte:component(?=[\s/>])/;
const SLOT = /^svelte:fragment(?=[\s/>])/;
const ELEMENT = /^svelte:element(?=[\s/>])/;

/** @param {import('#compiler').TemplateNode[]} stack */
function parent_is_head(stack) {
	let i = stack.length;
	while (i--) {
		const { type } = stack[i];
		if (type === 'SvelteHead') return true;
		if (type === 'RegularElement' || type === 'Component') return false;
	}
	return false;
}

/** @param {import('#compiler').TemplateNode[]} stack */
function parent_is_shadowroot_template(stack) {
	// https://developer.chrome.com/docs/css-ui/declarative-shadow-dom#building_a_declarative_shadow_root
	let i = stack.length;
	while (i--) {
		if (
			stack[i].type === 'RegularElement' &&
			/** @type {import('#compiler').RegularElement} */ (stack[i]).attributes.some(
				(a) => a.type === 'Attribute' && a.name === 'shadowrootmode'
			)
		) {
			return true;
		}
	}
	return false;
}

const regex_closing_textarea_tag = /^<\/textarea(\s[^>]*)?>/i;
const regex_closing_comment = /-->/;
const regex_capital_letter = /[A-Z]/;

/** @param {import('../index.js').Parser} parser */
export default function tag(parser) {
	const start = parser.index++;

	let parent = parser.current();

	if (parser.eat('!--')) {
		const data = parser.read_until(regex_closing_comment);
		parser.eat('-->', true);

		/** @type {ReturnType<typeof parser.append<import('#compiler').Comment>>} */
		parser.append({
			type: 'Comment',
			start,
			end: parser.index,
			data,
			ignores: extract_svelte_ignore(data)
		});

		return;
	}

	const is_closing_tag = parser.eat('/');

	const name = read_tag_name(parser);

	if (root_only_meta_tags.has(name)) {
		if (is_closing_tag) {
			if (
				(name === 'svelte:window' || name === 'svelte:body' || name === 'svelte:document') &&
				/** @type {import('#compiler').ElementLike} */ (parent).fragment.nodes.length
			) {
				error(
					/** @type {import('#compiler').ElementLike} */ (parent).fragment.nodes[0].start,
					'invalid-element-content',
					name
				);
			}
		} else {
			if (name in parser.meta_tags) {
				error(start, 'duplicate-svelte-element', name);
			}

			if (parent.type !== 'Root') {
				error(start, 'invalid-svelte-element-placement', name);
			}

			parser.meta_tags[name] = true;
		}
	}

	const type = meta_tags.has(name)
		? meta_tags.get(name)
		: regex_capital_letter.test(name[0]) || name === 'svelte:self' || name === 'svelte:component'
			? 'Component'
			: name === 'title' && parent_is_head(parser.stack)
				? 'TitleElement'
				: // TODO Svelte 6/7: once slots are removed in favor of snippets, always keep slot as a regular element
					name === 'slot' && !parent_is_shadowroot_template(parser.stack)
					? 'SlotElement'
					: 'RegularElement';

	/** @type {import('#compiler').ElementLike} */
	// @ts-expect-error TODO can't figure out this error
	const element =
		type === 'RegularElement'
			? {
					type: /** @type {import('#compiler').ElementLike['type']} */ (type),
					start,
					end: -1,
					name,
					attributes: [],
					fragment: create_fragment(true),
					metadata: {
						svg: false,
						has_spread: false
					},
					parent: null
				}
			: {
					type: /** @type {import('#compiler').ElementLike['type']} */ (type),
					start,
					end: -1,
					name,
					attributes: [],
					fragment: create_fragment(true),
					parent: null,
					metadata: {
						svg: false
					}
				};

	parser.allow_whitespace();

	if (is_closing_tag) {
		if (is_void(name)) {
			error(start, 'invalid-void-content');
		}

		parser.eat('>', true);

		// close any elements that don't have their own closing tags, e.g. <div><p></div>
		while (/** @type {import('#compiler').RegularElement} */ (parent).name !== name) {
			if (parent.type !== 'RegularElement') {
				if (parser.last_auto_closed_tag && parser.last_auto_closed_tag.tag === name) {
					error(
						start,
						'invalid-closing-tag-after-autoclose',
						name,
						parser.last_auto_closed_tag.reason
					);
				} else {
					error(start, 'invalid-closing-tag', name);
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
	} else if (parent.type === 'RegularElement' && closing_tag_omitted(parent.name, name)) {
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
		if (attribute.type === 'Attribute' || attribute.type === 'BindDirective') {
			if (unique_names.includes(attribute.name)) {
				error(attribute.start, 'duplicate-attribute');
				// <svelte:element bind:this this=..> is allowed
			} else if (attribute.name !== 'this') {
				unique_names.push(attribute.name);
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
			error(start, 'missing-svelte-component-definition');
		}

		const definition = /** @type {import('#compiler').Attribute} */ (
			element.attributes.splice(index, 1)[0]
		);
		if (
			definition.value === true ||
			definition.value.length !== 1 ||
			definition.value[0].type === 'Text'
		) {
			error(definition.start, 'invalid-svelte-component-definition');
		}

		element.expression = definition.value[0].expression;
	}

	if (element.type === 'SvelteElement') {
		const index = element.attributes.findIndex(
			/** @param {any} attr */
			(attr) => attr.type === 'Attribute' && attr.name === 'this'
		);
		if (index === -1) {
			error(start, 'missing-svelte-element-definition');
		}

		const definition = /** @type {import('#compiler').Attribute} */ (
			element.attributes.splice(index, 1)[0]
		);
		if (definition.value === true || definition.value.length !== 1) {
			error(definition.start, 'invalid-svelte-element-definition');
		}
		const chunk = definition.value[0];
		element.tag =
			chunk.type === 'Text'
				? { type: 'Literal', value: chunk.data, raw: `'${chunk.raw}'` }
				: chunk.expression;
	}

	if (is_top_level_script_or_style) {
		parser.eat('>', true);

		/** @type {import('#compiler').Comment | null} */
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
				if (current.module) error(start, 'duplicate-script-element');
				current.module = content;
			} else {
				if (current.instance) error(start, 'duplicate-script-element');
				current.instance = content;
			}
		} else {
			const content = read_style(parser, start, element.attributes);
			content.content.comment = prev_comment;

			if (current.css) error(start, 'duplicate-style-element');
			current.css = content;
		}
		return;
	}

	parser.append(element);

	const self_closing = parser.eat('/') || is_void(name);

	parser.eat('>', true);

	if (self_closing) {
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

		/** @type {import('#compiler').Text} */
		const node = {
			start,
			end,
			type: 'Text',
			data,
			raw: data,
			parent: null
		};

		element.fragment.nodes.push(node);
		parser.eat(`</${name}>`, true);
		element.end = parser.index;
	} else {
		parser.stack.push(element);
		parser.fragments.push(element.fragment);
	}
}

const regex_whitespace_or_slash_or_closing_tag = /(\s|\/|>)/;

/** @param {import('../index.js').Parser} parser */
function read_tag_name(parser) {
	const start = parser.index;

	if (parser.read(SELF)) {
		// check we're inside a block, otherwise this
		// will cause infinite recursion
		let i = parser.stack.length;
		let legal = false;

		while (i--) {
			const fragment = parser.stack[i];
			if (
				fragment.type === 'IfBlock' ||
				fragment.type === 'EachBlock' ||
				fragment.type === 'Component' ||
				fragment.type === 'SnippetBlock'
			) {
				legal = true;
				break;
			}
		}

		if (!legal) {
			error(start, 'invalid-self-placement');
		}

		return 'svelte:self';
	}

	if (parser.read(COMPONENT)) return 'svelte:component';
	if (parser.read(ELEMENT)) return 'svelte:element';

	if (parser.read(SLOT)) return 'svelte:fragment';

	const name = parser.read_until(regex_whitespace_or_slash_or_closing_tag);

	if (meta_tags.has(name)) return name;

	if (name.startsWith('svelte:')) {
		const match = fuzzymatch(name.slice(7), valid_meta_tags);
		error(start, 'invalid-svelte-tag', valid_meta_tags, match);
	}

	if (!valid_tag_name.test(name)) {
		error(start, 'invalid-tag-name');
	}

	return name;
}

// eslint-disable-next-line no-useless-escape
const regex_token_ending_character = /[\s=\/>"']/;
const regex_starts_with_quote_characters = /^["']/;
const regex_attribute_value = /^(?:"([^"]*)"|'([^'])*'|([^>\s]+))/;

/**
 * @param {import('../index.js').Parser} parser
 * @returns {import('#compiler').Attribute | null}
 */
function read_static_attribute(parser) {
	const start = parser.index;

	const name = parser.read_until(regex_token_ending_character);
	if (!name) return null;

	/** @type {true | Array<import('#compiler').Text | import('#compiler').ExpressionTag>} */
	let value = true;

	if (parser.eat('=')) {
		parser.allow_whitespace();
		let raw = parser.match_regex(regex_attribute_value);
		if (!raw) {
			error(parser.index, 'missing-attribute-value');
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
				data: decode_character_references(raw, true),
				parent: null
			}
		];
	}

	if (parser.match_regex(regex_starts_with_quote_characters)) {
		error(parser.index, 'expected-token', '=');
	}

	return create_attribute(name, start, parser.index, value);
}

/**
 * @param {import('../index.js').Parser} parser
 * @returns {import('#compiler').Attribute | import('#compiler').SpreadAttribute | import('#compiler').Directive | null}
 */
function read_attribute(parser) {
	const start = parser.index;

	if (parser.eat('{')) {
		parser.allow_whitespace();

		if (parser.eat('...')) {
			const expression = read_expression(parser);

			parser.allow_whitespace();
			parser.eat('}', true);

			/** @type {import('#compiler').SpreadAttribute} */
			const spread = {
				type: 'SpreadAttribute',
				start,
				end: parser.index,
				expression,
				parent: null,
				metadata: {
					contains_call_expression: false,
					dynamic: false
				}
			};

			return spread;
		} else {
			const value_start = parser.index;
			const name = parser.read_identifier();

			if (name === null) {
				error(start, 'empty-attribute-shorthand');
			}

			parser.allow_whitespace();
			parser.eat('}', true);

			/** @type {import('#compiler').ExpressionTag} */
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
				parent: null,
				metadata: {
					dynamic: false,
					contains_call_expression: false
				}
			};

			return create_attribute(name, start, parser.index, [expression]);
		}
	}

	const name = parser.read_until(regex_token_ending_character);
	if (!name) return null;

	let end = parser.index;

	parser.allow_whitespace();

	const colon_index = name.indexOf(':');
	const type = colon_index !== -1 && get_directive_type(name.slice(0, colon_index));

	/** @type {true | Array<import('#compiler').Text | import('#compiler').ExpressionTag>} */
	let value = true;
	if (parser.eat('=')) {
		parser.allow_whitespace();
		value = read_attribute_value(parser);
		end = parser.index;
	} else if (parser.match_regex(regex_starts_with_quote_characters)) {
		error(parser.index, 'expected-token', '=');
	}

	if (type) {
		const [directive_name, ...modifiers] = name.slice(colon_index + 1).split('|');

		if (directive_name === '') {
			error(start + colon_index + 1, 'empty-directive-name', type);
		}

		if (type === 'StyleDirective') {
			return {
				start,
				end,
				type,
				name: directive_name,
				modifiers: /** @type {Array<'important'>} */ (modifiers),
				value,
				parent: null,
				metadata: {
					dynamic: false
				}
			};
		}

		const first_value = value === true ? undefined : value[0];
		let expression = null;

		if (first_value) {
			const attribute_contains_text =
				/** @type {any[]} */ (value).length > 1 || first_value.type === 'Text';
			if (attribute_contains_text) {
				error(/** @type {number} */ (first_value.start), 'invalid-directive-value');
			} else {
				expression = first_value.expression;
			}
		}

		/** @type {import('#compiler').Directive} */
		// @ts-expect-error TODO can't figure out this error
		const directive = {
			start,
			end,
			type,
			name: directive_name,
			modifiers,
			expression
		};

		if (directive.type === 'ClassDirective') {
			directive.metadata = {
				dynamic: false
			};
		}

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
 * @param {import('../index.js').Parser} parser
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
				data: '',
				parent: null
			}
		];
	}

	let value;
	try {
		value = read_sequence(
			parser,
			() => {
				// handle common case of quote marks existing outside of regex for performance reasons
				if (quote_mark) return parser.match(quote_mark);
				return !!parser.match_regex(regex_starts_with_invalid_attr_value);
			},
			'in attribute value'
		);
	} catch (/** @type {any} e */ e) {
		if (e.code === 'js-parse-error') {
			// if the attribute value didn't close + self-closing tag
			// eg: `<Component test={{a:1} />`
			// acorn may throw a `Unterminated regular expression` because of `/>`
			const pos = e.position?.[0];
			if (pos !== undefined && parser.template.slice(pos - 1, pos + 1) === '/>') {
				parser.index = pos;
				error(pos, 'unclosed-attribute-value', quote_mark || '}');
			}
		}
		throw e;
	}

	if (value.length === 0 && !quote_mark) {
		error(parser.index, 'missing-attribute-value');
	}

	if (quote_mark) parser.index += 1;
	return value;
}

/**
 * @param {import('../index.js').Parser} parser
 * @param {() => boolean} done
 * @param {string} location
 * @returns {any[]}
 */
function read_sequence(parser, done, location) {
	/** @type {import('#compiler').Text} */
	let current_chunk = {
		start: parser.index,
		end: -1,
		type: 'Text',
		raw: '',
		data: '',
		parent: null
	};

	/** @type {Array<import('#compiler').Text | import('#compiler').ExpressionTag>} */
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
				error(index, 'invalid-block-placement', location, name);
			} else if (parser.match('@')) {
				const index = parser.index - 1;
				parser.eat('@');
				const name = parser.read_until(/[^a-z]/);
				error(index, 'invalid-tag-placement', location, name);
			}

			flush(parser.index - 1);

			parser.allow_whitespace();
			const expression = read_expression(parser);
			parser.allow_whitespace();
			parser.eat('}', true);

			/** @type {import('#compiler').ExpressionTag} */
			const chunk = {
				type: 'ExpressionTag',
				start: index,
				end: parser.index,
				expression,
				parent: null,
				metadata: {
					contains_call_expression: false,
					dynamic: false
				}
			};

			chunks.push(chunk);

			current_chunk = {
				start: parser.index,
				end: -1,
				type: 'Text',
				raw: '',
				data: '',
				parent: null
			};
		} else {
			current_chunk.raw += parser.template[parser.index++];
		}
	}

	error(parser.template.length, 'unexpected-eof');
}
