import read_expression from '../read/expression';
import read_script from '../read/script';
import read_style from '../read/style';
import { decode_character_references, closing_tag_omitted } from '../utils/html';
import { is_void } from '../../utils/names';
import { Parser } from '../index';
import { Directive, DirectiveType, Node, Text } from '../../interfaces';
import fuzzymatch from '../../utils/fuzzymatch';
import list from '../../utils/list';

// eslint-disable-next-line no-useless-escape
const valid_tag_name = /^\!?[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;

const meta_tags = new Map([
	['svelte:head', 'Head'],
	['svelte:options', 'Options'],
	['svelte:window', 'Window'],
	['svelte:body', 'Body']
]);

const valid_meta_tags = Array.from(meta_tags.keys()).concat('svelte:self', 'svelte:component');

const specials = new Map([
	[
		'script',
		{
			read: read_script,
			property: 'js',
		},
	],
	[
		'style',
		{
			read: read_style,
			property: 'css',
		},
	],
]);

// eslint-disable-next-line no-useless-escape
const SELF = /^svelte:self(?=[\s\/>])/;
// eslint-disable-next-line no-useless-escape
const COMPONENT = /^svelte:component(?=[\s\/>])/;

function parent_is_head(stack) {
	let i = stack.length;
	while (i--) {
		const { type } = stack[i];
		if (type === 'Head') return true;
		if (type === 'Element' || type === 'InlineComponent') return false;
	}
	return false;
}

export default function tag(parser: Parser) {
	const start = parser.index++;

	let parent = parser.current();

	if (parser.eat('!--')) {
		const data = parser.read_until(/-->/);
		parser.eat('-->', true, 'comment was left open, expected -->');

		parser.current().children.push({
			start,
			end: parser.index,
			type: 'Comment',
			data,
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
				parser.error({
					code: `invalid-${name.slice(7)}-content`,
					message: `<${name}> cannot have children`
				}, parser.current().children[0].start);
			}
		} else {
			if (name in parser.meta_tags) {
				parser.error({
					code: `duplicate-${slug}`,
					message: `A component can only have one <${name}> tag`
				}, start);
			}

			if (parser.stack.length > 1) {
				parser.error({
					code: `invalid-${slug}-placement`,
					message: `<${name}> tags cannot be inside elements or blocks`
				}, start);
			}

			parser.meta_tags[name] = true;
		}
	}

	const type = meta_tags.has(name)
		? meta_tags.get(name)
		: (/[A-Z]/.test(name[0]) || name === 'svelte:self' || name === 'svelte:component') ? 'InlineComponent'
			: name === 'title' && parent_is_head(parser.stack) ? 'Title'
				: name === 'slot' && !parser.customElement ? 'Slot' : 'Element';

	const element: Node = {
		start,
		end: null, // filled in later
		type,
		name,
		attributes: [],
		children: [],
	};

	parser.allow_whitespace();

	if (is_closing_tag) {
		if (is_void(name)) {
			parser.error({
				code: `invalid-void-content`,
				message: `<${name}> is a void element and cannot have children, or a closing tag`
			}, start);
		}

		parser.eat('>', true);

		// close any elements that don't have their own closing tags, e.g. <div><p></div>
		while (parent.name !== name) {
			if (parent.type !== 'Element')
				parser.error({
					code: `invalid-closing-tag`,
					message: `</${name}> attempted to close an element that was not open`
				}, start);

			parent.end = start;
			parser.stack.pop();

			parent = parser.current();
		}

		parent.end = parser.index;
		parser.stack.pop();

		return;
	} else if (closing_tag_omitted(parent.name, name)) {
		parent.end = start;
		parser.stack.pop();
	}

	const unique_names: Set<string> = new Set();

	let attribute;
	while ((attribute = read_attribute(parser, unique_names))) {
		element.attributes.push(attribute);
		parser.allow_whitespace();
	}

	if (name === 'svelte:component') {
		const index = element.attributes.findIndex(attr => attr.type === 'Attribute' && attr.name === 'this');
		if (!~index) {
			parser.error({
				code: `missing-component-definition`,
				message: `<svelte:component> must have a 'this' attribute`
			}, start);
		}

		const definition = element.attributes.splice(index, 1)[0];
		if (definition.value === true || definition.value.length !== 1 || definition.value[0].type === 'Text') {
			parser.error({
				code: `invalid-component-definition`,
				message: `invalid component definition`
			}, definition.start);
		}

		element.expression = definition.value[0].expression;
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
			() =>
				parser.template.slice(parser.index, parser.index + 11) === '</textarea>'
		);
		parser.read(/<\/textarea>/);
		element.end = parser.index;
	} else if (name === 'script') {
		// special case
		const start = parser.index;
		const data = parser.read_until(/<\/script>/);
		const end = parser.index;
		element.children.push({ start, end, type: 'Text', data });
		parser.eat('</script>', true);
		element.end = parser.index;
	} else if (name === 'style') {
		// special case
		const start = parser.index;
		const data = parser.read_until(/<\/style>/);
		const end = parser.index;
		element.children.push({ start, end, type: 'Text', data });
		parser.eat('</style>', true);
	} else {
		parser.stack.push(element);
	}
}

function read_tag_name(parser: Parser) {
	const start = parser.index;

	if (parser.read(SELF)) {
		// check we're inside a block, otherwise this
		// will cause infinite recursion
		let i = parser.stack.length;
		let legal = false;

		while (i--) {
			const fragment = parser.stack[i];
			if (fragment.type === 'IfBlock' || fragment.type === 'EachBlock') {
				legal = true;
				break;
			}
		}

		if (!legal) {
			parser.error({
				code: `invalid-self-placement`,
				message: `<svelte:self> components can only exist inside if-blocks or each-blocks`
			}, start);
		}

		return 'svelte:self';
	}

	if (parser.read(COMPONENT)) return 'svelte:component';

	const name = parser.read_until(/(\s|\/|>)/);

	if (meta_tags.has(name)) return name;

	if (name.startsWith('svelte:')) {
		const match = fuzzymatch(name.slice(7), valid_meta_tags);

		let message = `Valid <svelte:...> tag names are ${list(valid_meta_tags)}`;
		if (match) message += ` (did you mean '${match}'?)`;

		parser.error({
			code: 'invalid-tag-name',
			message
		}, start);
	}

	if (!valid_tag_name.test(name)) {
		parser.error({
			code: `invalid-tag-name`,
			message: `Expected valid tag name`
		}, start);
	}

	return name;
}

function read_attribute(parser: Parser, unique_names: Set<string>) {
	const start = parser.index;

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

	// eslint-disable-next-line no-useless-escape
	const name = parser.read_until(/[\s=\/>"']/);
	if (!name) return null;

	let end = parser.index;

	parser.allow_whitespace();

	const colon_index = name.indexOf(':');
	const type = colon_index !== -1 && get_directive_type(name.slice(0, colon_index));

	if (unique_names.has(name)) {
		parser.error({
			code: `duplicate-attribute`,
			message: 'Attributes need to be unique'
		}, start);
	}

	if (type !== "EventHandler") {
		unique_names.add(name);
	}

	let value: any[] | true = true;
	if (parser.eat('=')) {
		parser.allow_whitespace();
		value = read_attribute_value(parser);
		end = parser.index;
	} else if (parser.match_regex(/["']/)) {
		parser.error({
			code: `unexpected-token`,
			message: `Expected =`
		}, parser.index);
	}

	if (type) {
		const [directive_name, ...modifiers] = name.slice(colon_index + 1).split('|');

		if (type === 'Ref') {
			parser.error({
				code: `invalid-ref-directive`,
				message: `The ref directive is no longer supported — use \`bind:this={${directive_name}}\` instead`
			}, start);
		}

		if (value[0]) {
			if ((value as any[]).length > 1 || value[0].type === 'Text') {
				parser.error({
					code: `invalid-directive-value`,
					message: `Directive value must be a JavaScript expression enclosed in curly braces`
				}, value[0].start);
			}
		}

		const directive: Directive = {
			start,
			end,
			type,
			name: directive_name,
			modifiers,
			expression: (value[0] && value[0].expression) || null
		};

		if (type === 'Transition') {
			const direction = name.slice(0, colon_index);
			directive.intro = direction === 'in' || direction === 'transition';
			directive.outro = direction === 'out' || direction === 'transition';
		}

		if (!directive.expression && (type === 'Binding' || type === 'Class')) {
			directive.expression = {
				start: directive.start + colon_index + 1,
				end: directive.end,
				type: 'Identifier',
				name: directive.name
			};
		}

		return directive;
	}

	return {
		start,
		end,
		type: 'Attribute',
		name,
		value,
	};
}

function get_directive_type(name: string): DirectiveType {
	if (name === 'use') return 'Action';
	if (name === 'animate') return 'Animation';
	if (name === 'bind') return 'Binding';
	if (name === 'class') return 'Class';
	if (name === 'on') return 'EventHandler';
	if (name === 'let') return 'Let';
	if (name === 'ref') return 'Ref';
	if (name === 'in' || name === 'out' || name === 'transition') return 'Transition';
}

function read_attribute_value(parser: Parser) {
	const quote_mark = parser.eat(`'`) ? `'` : parser.eat(`"`) ? `"` : null;

	const regex = (
		quote_mark === `'` ? /'/ :
			quote_mark === `"` ? /"/ :
				/(\/>|[\s"'=<>`])/
	);

	const value = read_sequence(parser, () => !!parser.match_regex(regex));

	if (quote_mark) parser.index += 1;
	return value;
}

function read_sequence(parser: Parser, done: () => boolean): Node[] {
	let current_chunk: Text = {
		start: parser.index,
		end: null,
		type: 'Text',
		raw: '',
		data: null
	};

	function flush() {
		if (current_chunk.raw) {
			current_chunk.data = decode_character_references(current_chunk.raw);
			current_chunk.end = parser.index;
			chunks.push(current_chunk);
		}
	}

	const chunks: Node[] = [];

	while (parser.index < parser.template.length) {
		const index = parser.index;

		if (done()) {
			flush();
			return chunks;
		} else if (parser.eat('{')) {
			flush();

			parser.allow_whitespace();
			const expression = read_expression(parser);
			parser.allow_whitespace();
			parser.eat('}', true);

			chunks.push({
				start: index,
				end: parser.index,
				type: 'MustacheTag',
				expression,
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

	parser.error({
		code: `unexpected-eof`,
		message: `Unexpected end of input`
	});
}
