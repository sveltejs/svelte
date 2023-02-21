import { Directive, DirectiveType, TemplateNode, Text } from '../../interfaces';
import { extract_svelte_ignore } from '../../utils/extract_svelte_ignore';
import fuzzymatch from '../../utils/fuzzymatch';
import { is_void } from '../../../shared/utils/names';
import parser_errors from '../errors';
import { Parser } from '../index';
import read_expression from '../read/expression';
import read_script from '../read/script';
import read_style from '../read/style';
import { closing_tag_omitted, decode_character_references } from '../utils/html';

// eslint-disable-next-line no-useless-escape
const valid_tag_name = /^\!?[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;

/** Invalid attribute characters if the attribute is not surrounded by quotes */
const regex_starts_with_invalid_attr_value = /^(\/>|[\s"'=<>`])/;

const meta_tags = new Map([
	['svelte:head', 'Head'],
	['svelte:options', 'Options'],
	['svelte:window', 'Window'],
	['svelte:body', 'Body']
]);

const valid_meta_tags = Array.from(meta_tags.keys()).concat('svelte:self', 'svelte:component', 'svelte:fragment', 'svelte:element');

const specials = new Map([
	[
		'script',
		{
			read: read_script,
			property: 'js'
		}
	],
	[
		'style',
		{
			read: read_style,
			property: 'css'
		}
	]
]);

const SELF = /^svelte:self(?=[\s/>])/;
const COMPONENT = /^svelte:component(?=[\s/>])/;
const SLOT = /^svelte:fragment(?=[\s/>])/;
const ELEMENT = /^svelte:element(?=[\s/>])/;

function parent_is_head(stack) {
	let i = stack.length;
	while (i--) {
		const { type } = stack[i];
		if (type === 'Head') return true;
		if (type === 'Element' || type === 'InlineComponent') return false;
	}
	return false;
}

const regex_closing_textarea_tag = /^<\/textarea(\s[^>]*)?>/i;
const regex_closing_comment = /-->/;
const regex_capital_letter = /[A-Z]/;

export default function tag(parser: Parser) {
	const start = parser.index++;

	let parent = parser.current();

	if (parser.eat('!--')) {
		const data = parser.read_until(regex_closing_comment);
		parser.eat('-->', true, parser_errors.unclosed_comment);

		parser.current().children.push({
			start,
			end: parser.index,
			type: 'Comment',
			data,
			ignores: extract_svelte_ignore(data)
		});

		return;
	}

	const is_closing_tag = parser.eat('/');

	const name = read_tag_name(parser);

	if (meta_tags.has(name)) {
		const slug = meta_tags.get(name).toLowerCase();
		if (is_closing_tag) {
			if (
				(name === 'svelte:window' || name === 'svelte:body') &&
				parser.current().children.length
			) {
				parser.error(
					parser_errors.invalid_element_content(slug, name),
					parser.current().children[0].start
				);
			}
		} else {
			if (name in parser.meta_tags) {
				parser.error(parser_errors.duplicate_element(slug, name), start);
			}

			if (parser.stack.length > 1) {
				parser.error(parser_errors.invalid_element_placement(slug, name), start);
			}

			parser.meta_tags[name] = true;
		}
	}

	const type = meta_tags.has(name)
		? meta_tags.get(name)
		: (regex_capital_letter.test(name[0]) || name === 'svelte:self' || name === 'svelte:component') ? 'InlineComponent'
			: name === 'svelte:fragment' ? 'SlotTemplate'
				: name === 'title' && parent_is_head(parser.stack) ? 'Title'
					: name === 'slot' && !parser.customElement ? 'Slot' : 'Element';

	const element: TemplateNode = {
		start,
		end: null, // filled in later
		type,
		name,
		attributes: [],
		children: []
	};

	parser.allow_whitespace();

	if (is_closing_tag) {
		if (is_void(name)) {
			parser.error(parser_errors.invalid_void_content(name), start);
		}

		parser.eat('>', true);

		// close any elements that don't have their own closing tags, e.g. <div><p></div>
		while (parent.name !== name) {
			if (parent.type !== 'Element') {
				const error = parser.last_auto_closed_tag && parser.last_auto_closed_tag.tag === name
					? parser_errors.invalid_closing_tag_autoclosed(name, parser.last_auto_closed_tag.reason)
					: parser_errors.invalid_closing_tag_unopened(name);
				parser.error(error, start);
			}

			parent.end = start;
			parser.stack.pop();

			parent = parser.current();
		}

		parent.end = parser.index;
		parser.stack.pop();

		if (parser.last_auto_closed_tag && parser.stack.length < parser.last_auto_closed_tag.depth) {
			parser.last_auto_closed_tag = null;
		}

		return;
	} else if (closing_tag_omitted(parent.name, name)) {
		parent.end = start;
		parser.stack.pop();
		parser.last_auto_closed_tag = {
			tag: parent.name,
			reason: name,
			depth: parser.stack.length
		};
	}

	const unique_names: Set<string> = new Set();

	let attribute;
	while ((attribute = read_attribute(parser, unique_names))) {
		element.attributes.push(attribute);
		parser.allow_whitespace();
	}

	if (name === 'svelte:component') {
		const index = element.attributes.findIndex(attr => attr.type === 'Attribute' && attr.name === 'this');
		if (index === -1) {
			parser.error(parser_errors.missing_component_definition, start);
		}

		const definition = element.attributes.splice(index, 1)[0];
		if (definition.value === true || definition.value.length !== 1 || definition.value[0].type === 'Text') {
			parser.error(parser_errors.invalid_component_definition, definition.start);
		}

		element.expression = definition.value[0].expression;
	}

	if (name === 'svelte:element') {
		const index = element.attributes.findIndex(attr => attr.type === 'Attribute' && attr.name === 'this');
		if (index === -1) {
			parser.error(parser_errors.missing_element_definition, start);
		}

		const definition = element.attributes.splice(index, 1)[0];
		if (definition.value === true) {
			parser.error(parser_errors.invalid_element_definition, definition.start);
		}
		element.tag = definition.value[0].data || definition.value[0].expression;
	}

	// special cases – top-level <script> and <style>
	if (specials.has(name) && parser.stack.length === 1) {
		const special = specials.get(name);

		parser.eat('>', true);
		const content = special.read(parser, start, element.attributes);
		if (content) parser[special.property].push(content);
		return;
	}

	parser.current().children.push(element);

	const self_closing = parser.eat('/') || is_void(name);

	parser.eat('>', true);

	if (self_closing) {
		// don't push self-closing elements onto the stack
		element.end = parser.index;
	} else if (name === 'textarea') {
		// special case
		element.children = read_sequence(
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
		element.children.push({ start, end, type: 'Text', data });
		parser.eat(`</${name}>`, true);
		element.end = parser.index;
	} else {
		parser.stack.push(element);
	}
}

const regex_whitespace_or_slash_or_closing_tag = /(\s|\/|>)/;

function read_tag_name(parser: Parser) {
	const start = parser.index;

	if (parser.read(SELF)) {
		// check we're inside a block, otherwise this
		// will cause infinite recursion
		let i = parser.stack.length;
		let legal = false;

		while (i--) {
			const fragment = parser.stack[i];
			if (fragment.type === 'IfBlock' || fragment.type === 'EachBlock' || fragment.type === 'InlineComponent') {
				legal = true;
				break;
			}
		}

		if (!legal) {
			parser.error(parser_errors.invalid_self_placement, start);
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

		parser.error(
			parser_errors.invalid_tag_name_svelte_element(valid_meta_tags, match),
			start
		);
	}

	if (!valid_tag_name.test(name)) {
		parser.error(parser_errors.invalid_tag_name, start);
	}

	return name;
}

// eslint-disable-next-line no-useless-escape
const regex_token_ending_character = /[\s=\/>"']/;
const regex_starts_with_quote_characters = /^["']/;

function read_attribute(parser: Parser, unique_names: Set<string>) {
	const start = parser.index;

	function check_unique(name: string) {
		if (unique_names.has(name)) {
			parser.error(parser_errors.duplicate_attribute, start);
		}
		unique_names.add(name);
	}

	if (parser.eat('{')) {
		parser.allow_whitespace();

		if (parser.eat('...')) {
			const expression = read_expression(parser);

			parser.allow_whitespace();
			parser.eat('}', true);

			return {
				start,
				end: parser.index,
				type: 'Spread',
				expression
			};
		} else {
			const value_start = parser.index;

			const name = parser.read_identifier();
			parser.allow_whitespace();
			parser.eat('}', true);

			if (name === null) {
				parser.error(parser_errors.empty_attribute_shorthand, start);
			}

			check_unique(name);

			return {
				start,
				end: parser.index,
				type: 'Attribute',
				name,
				value: [{
					start: value_start,
					end: value_start + name.length,
					type: 'AttributeShorthand',
					expression: {
						start: value_start,
						end: value_start + name.length,
						type: 'Identifier',
						name
					}
				}]
			};
		}
	}

	const name = parser.read_until(regex_token_ending_character);
	if (!name) return null;

	let end = parser.index;

	parser.allow_whitespace();

	const colon_index = name.indexOf(':');
	const type = colon_index !== -1 && get_directive_type(name.slice(0, colon_index));

	let value: any[] | true = true;
	if (parser.eat('=')) {
		parser.allow_whitespace();
		value = read_attribute_value(parser);
		end = parser.index;
	} else if (parser.match_regex(regex_starts_with_quote_characters)) {
		parser.error(parser_errors.unexpected_token('='), parser.index);
	}

	if (type) {
		const [directive_name, ...modifiers] = name.slice(colon_index + 1).split('|');

		if (directive_name === '') {
			parser.error(parser_errors.empty_directive_name(type), start + colon_index + 1);
		}

		if (type === 'Binding' && directive_name !== 'this') {
			check_unique(directive_name);
		} else if (type !== 'EventHandler' && type !== 'Action') {
			check_unique(name);
		}

		if (type === 'Ref') {
			parser.error(parser_errors.invalid_ref_directive(directive_name), start);
		}

		if (type === 'StyleDirective') {
			return {
				start,
				end,
				type,
				name: directive_name,
				modifiers,
				value
			};
		}

		const first_value = value[0];
		let expression = null;

		if (first_value) {
			const attribute_contains_text = (value as any[]).length > 1 || first_value.type === 'Text';
			if (attribute_contains_text) {
				parser.error(parser_errors.invalid_directive_value, first_value.start);
			} else {
				expression = first_value.expression;
			}
		}

		const directive: Directive = {
			start,
			end,
			type,
			name: directive_name,
			modifiers,
			expression
		};

		if (type === 'Transition') {
			const direction = name.slice(0, colon_index);
			directive.intro = direction === 'in' || direction === 'transition';
			directive.outro = direction === 'out' || direction === 'transition';
		}

		// Directive name is expression, e.g. <p class:isRed />
		if (!directive.expression && (type === 'Binding' || type === 'Class')) {
			directive.expression = {
				start: directive.start + colon_index + 1,
				end: directive.end,
				type: 'Identifier',
				name: directive.name
			} as any;
		}

		return directive;
	}

	check_unique(name);

	return {
		start,
		end,
		type: 'Attribute',
		name,
		value
	};
}

function get_directive_type(name: string): DirectiveType {
	if (name === 'use') return 'Action';
	if (name === 'animate') return 'Animation';
	if (name === 'bind') return 'Binding';
	if (name === 'class') return 'Class';
	if (name === 'style') return 'StyleDirective';
	if (name === 'on') return 'EventHandler';
	if (name === 'let') return 'Let';
	if (name === 'ref') return 'Ref';
	if (name === 'in' || name === 'out' || name === 'transition') return 'Transition';
}

function read_attribute_value(parser: Parser) {
	const quote_mark = parser.eat("'") ? "'" : parser.eat('"') ? '"' : null;
	if (quote_mark && parser.eat(quote_mark)) {
		return [{
			start: parser.index - 1,
			end: parser.index - 1,
			type: 'Text',
			raw: '',
			data: ''
		}];
	}

	let value;
	try {
		value = read_sequence(parser, () => {
			// handle common case of quote marks existing outside of regex for performance reasons
			if (quote_mark) return parser.match(quote_mark);
			return !!parser.match_regex(regex_starts_with_invalid_attr_value);
		}, 'in attribute value');
	} catch (error) {
		if (error.code === 'parse-error') {
			// if the attribute value didn't close + self-closing tag
			// eg: `<Component test={{a:1} />`
			// acorn may throw a `Unterminated regular expression` because of `/>`
			if (parser.template.slice(error.pos - 1, error.pos + 1) === '/>') {
				parser.index = error.pos;
				parser.error(parser_errors.unclosed_attribute_value(quote_mark || '}'));
			}
		}
		throw error;
	}

	if (value.length === 0 && !quote_mark) {
		parser.error(parser_errors.missing_attribute_value);
	}

	if (quote_mark) parser.index += 1;
	return value;
}

function read_sequence(parser: Parser, done: () => boolean, location: string): TemplateNode[] {
	let current_chunk: Text = {
		start: parser.index,
		end: null,
		type: 'Text',
		raw: '',
		data: null
	};

	const chunks: TemplateNode[] = [];

	function flush(end: number) {
		if (current_chunk.raw) {
			current_chunk.data = decode_character_references(current_chunk.raw);
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
				parser.error(parser_errors.invalid_logic_block_placement(location, name), index);
			} else if (parser.match('@')) {
				const index = parser.index - 1;
				parser.eat('@');
				const name = parser.read_until(/[^a-z]/);
				parser.error(parser_errors.invalid_tag_placement(location, name), index);
			}

			flush(parser.index - 1);

			parser.allow_whitespace();
			const expression = read_expression(parser);
			parser.allow_whitespace();
			parser.eat('}', true);

			chunks.push({
				start: index,
				end: parser.index,
				type: 'MustacheTag',
				expression
			});

			current_chunk = {
				start: parser.index,
				end: null,
				type: 'Text',
				raw: '',
				data: null
			};
		} else {
			current_chunk.raw += parser.template[parser.index++];
		}
	}

	parser.error(parser_errors.unexpected_eof);
}
