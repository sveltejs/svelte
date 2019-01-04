import readExpression from '../read/expression';
import readScript from '../read/script';
import readStyle from '../read/style';
import { decodeCharacterReferences } from '../utils/html';
import isVoidElementName from '../../utils/isVoidElementName';
import { Parser } from '../index';
import { Node } from '../../interfaces';

const validTagName = /^\!?[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;

const metaTags = new Map([
	['svelte:document', 'Document'],
	['svelte:window', 'Window'],
	['svelte:meta', 'Meta'],
	['svelte:head', 'Head']
]);

const specials = new Map([
	[
		'script',
		{
			read: readScript,
			property: 'js',
		},
	],
	[
		'style',
		{
			read: readStyle,
			property: 'css',
		},
	],
]);

const SELF = 'svelte:self';
const COMPONENT = 'svelte:component';

// based on http://developers.whatwg.org/syntax.html#syntax-tag-omission
const disallowedContents = new Map([
	['li', new Set(['li'])],
	['dt', new Set(['dt', 'dd'])],
	['dd', new Set(['dt', 'dd'])],
	[
		'p',
		new Set(
			'address article aside blockquote div dl fieldset footer form h1 h2 h3 h4 h5 h6 header hgroup hr main menu nav ol p pre section table ul'.split(
				' '
			)
		),
	],
	['rt', new Set(['rt', 'rp'])],
	['rp', new Set(['rt', 'rp'])],
	['optgroup', new Set(['optgroup'])],
	['option', new Set(['option', 'optgroup'])],
	['thead', new Set(['tbody', 'tfoot'])],
	['tbody', new Set(['tbody', 'tfoot'])],
	['tfoot', new Set(['tbody'])],
	['tr', new Set(['tr', 'tbody'])],
	['td', new Set(['td', 'th', 'tr'])],
	['th', new Set(['td', 'th', 'tr'])],
]);

function parentIsHead(stack) {
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
		const data = parser.readUntil(/-->/);
		parser.eat('-->', true, 'comment was left open, expected -->');

		parser.current().children.push({
			start,
			end: parser.index,
			type: 'Comment',
			data,
		});

		return;
	}

	const isClosingTag = parser.eat('/');

	const name = readTagName(parser);

	if (metaTags.has(name)) {
		const slug = metaTags.get(name).toLowerCase();
		if (isClosingTag) {
			if (
				(name === 'svelte:window' || name === 'svelte:document') &&
				parser.current().children.length
			) {
				parser.error({
					code: `invalid-${name.slice(7)}-content`,
					message: `<${name}> cannot have children`
				}, parser.current().children[0].start);
			}
		} else {
			if (name in parser.metaTags) {
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

			parser.metaTags[name] = true;
		}
	}

	const type = metaTags.has(name)
		? metaTags.get(name)
		: (/[A-Z]/.test(name[0]) || name === 'svelte:self' || name === 'svelte:component') ? 'InlineComponent'
		: name === 'title' && parentIsHead(parser.stack) ? 'Title'
		: name === 'slot' && !parser.customElement ? 'Slot' : 'Element';

	const element: Node = {
		start,
		end: null, // filled in later
		type,
		name,
		attributes: [],
		children: [],
	};

	parser.allowWhitespace();

	if (isClosingTag) {
		if (isVoidElementName(name)) {
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
	} else if (disallowedContents.has(parent.name)) {
		// can this be a child of the parent element, or does it implicitly
		// close it, like `<li>one<li>two`?
		if (disallowedContents.get(parent.name).has(name)) {
			parent.end = start;
			parser.stack.pop();
		}
	}

	if (name === 'slot') {
		let i = parser.stack.length;
		while (i--) {
			const item = parser.stack[i];
			if (item.type === 'EachBlock') {
				parser.error({
					code: `invalid-slot-placement`,
					message: `<slot> cannot be a child of an each-block`
				}, start);
			}
		}
	}

	const uniqueNames = new Set();

	let attribute;
	while ((attribute = readAttribute(parser, uniqueNames))) {
		if (attribute.type === 'Binding' && !parser.allowBindings) {
			parser.error({
				code: `binding-disabled`,
				message: `Two-way binding is disabled`
			}, attribute.start);
		}

		element.attributes.push(attribute);
		parser.allowWhitespace();
	}

	if (name === 'svelte:component') {
		// TODO post v2, treat this just as any other attribute
		const index = element.attributes.findIndex(attr => attr.name === 'this');
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

	const selfClosing = parser.eat('/') || isVoidElementName(name);

	parser.eat('>', true);

	if (selfClosing) {
		// don't push self-closing elements onto the stack
		element.end = parser.index;
	} else if (name === 'textarea') {
		// special case
		element.children = readSequence(
			parser,
			() =>
				parser.template.slice(parser.index, parser.index + 11) === '</textarea>'
		);
		parser.read(/<\/textarea>/);
		element.end = parser.index;
	} else if (name === 'script') {
		// special case
		const start = parser.index;
		const data = parser.readUntil(/<\/script>/);
		const end = parser.index;
		element.children.push({ start, end, type: 'Text', data });
		parser.eat('</script>', true);
		element.end = parser.index;
	} else if (name === 'style') {
		// special case
		const start = parser.index;
		const data = parser.readUntil(/<\/style>/);
		const end = parser.index;
		element.children.push({ start, end, type: 'Text', data });
		parser.eat('</style>', true);
	} else {
		parser.stack.push(element);
	}
}

function readTagName(parser: Parser) {
	const start = parser.index;

	if (parser.eat(SELF)) {
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
				message: `<${SELF}> components can only exist inside if-blocks or each-blocks`
			}, start);
		}

		return SELF;
	}

	if (parser.eat(COMPONENT)) return COMPONENT;

	const name = parser.readUntil(/(\s|\/|>)/);

	if (metaTags.has(name)) return name;

	if (!validTagName.test(name)) {
		parser.error({
			code: `invalid-tag-name`,
			message: `Expected valid tag name`
		}, start);
	}

	return name;
}

function readAttribute(parser: Parser, uniqueNames: Set<string>) {
	const start = parser.index;

	if (parser.eat('{')) {
		parser.allowWhitespace();

		if (parser.eat('...')) {
			const expression = readExpression(parser);

			parser.allowWhitespace();
			parser.eat('}', true);

			return {
				start,
				end: parser.index,
				type: 'Spread',
				expression
			};
		} else {
			const valueStart = parser.index;

			const name = parser.readIdentifier();
			parser.allowWhitespace();
			parser.eat('}', true);

			return {
				start,
				end: parser.index,
				type: 'Attribute',
				name,
				value: [{
					start: valueStart,
					end: valueStart + name.length,
					type: 'AttributeShorthand',
					expression: {
						start: valueStart,
						end: valueStart + name.length,
						type: 'Identifier',
						name
					}
				}]
			};
		}
	}

	let name = parser.readUntil(/(\s|=|\/|>)/);
	if (!name) return null;
	if (uniqueNames.has(name)) {
		parser.error({
			code: `duplicate-attribute`,
			message: 'Attributes need to be unique'
		}, start);
	}

	uniqueNames.add(name);

	let end = parser.index;

	parser.allowWhitespace();

	const colon_index = name.indexOf(':');
	const type = colon_index !== -1 && get_directive_type(name.slice(0, colon_index));

	let value: any[] | true = true;
	if (parser.eat('=')) {
		value = readAttributeValue(parser);
		end = parser.index;
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
			if (value.length > 1 || value[0].type === 'Text') {
				parser.error({
					code: `invalid-directive-value`,
					message: `Directive value must be a JavaScript expression enclosed in curly braces`
				}, value[0].start);
			}
		}

		const directive = {
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

function get_directive_type(name) {
	if (name === 'use') return 'Action';
	if (name === 'animate') return 'Animation';
	if (name === 'bind') return 'Binding';
	if (name === 'class') return 'Class';
	if (name === 'on') return 'EventHandler';
	if (name === 'ref') return 'Ref';
	if (name === 'in' || name === 'out' || name === 'transition') return 'Transition';
}

function readAttributeValue(parser: Parser) {
	const quoteMark = parser.eat(`'`) ? `'` : parser.eat(`"`) ? `"` : null;

	const regex = (
		quoteMark === `'` ? /'/ :
		quoteMark === `"` ? /"/ :
		/(\/>|[\s"'=<>`])/
	);

	const value = readSequence(parser, () => !!parser.matchRegex(regex));

	if (quoteMark) parser.index += 1;
	return value;
}

function readSequence(parser: Parser, done: () => boolean) {
	let currentChunk: Node = {
		start: parser.index,
		end: null,
		type: 'Text',
		data: '',
	};

	const chunks = [];

	while (parser.index < parser.template.length) {
		const index = parser.index;

		if (done()) {
			currentChunk.end = parser.index;

			if (currentChunk.data) chunks.push(currentChunk);

			chunks.forEach(chunk => {
				if (chunk.type === 'Text')
					chunk.data = decodeCharacterReferences(chunk.data);
			});

			return chunks;
		} else if (parser.eat('{')) {
			if (currentChunk.data) {
				currentChunk.end = index;
				chunks.push(currentChunk);
			}

			parser.allowWhitespace();
			const expression = readExpression(parser);
			parser.allowWhitespace();
			parser.eat('}', true);

			chunks.push({
				start: index,
				end: parser.index,
				type: 'MustacheTag',
				expression,
			});

			currentChunk = {
				start: parser.index,
				end: null,
				type: 'Text',
				data: '',
			};
		} else {
			currentChunk.data += parser.template[parser.index++];
		}
	}

	parser.error({
		code: `unexpected-eof`,
		message: `Unexpected end of input`
	});
}