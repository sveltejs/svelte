import readExpression from '../read/expression';
import readScript from '../read/script';
import readStyle from '../read/style';
import {
	readEventHandlerDirective,
	readBindingDirective,
	readTransitionDirective,
} from '../read/directives';
import { trimStart, trimEnd } from '../../utils/trim';
import { decodeCharacterReferences } from '../utils/html';
import isVoidElementName from '../../utils/isVoidElementName';
import { Parser } from '../index';
import { Node } from '../../interfaces';

const validTagName = /^\!?[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;

const SELF = ':Self';
const SWITCH = ':Component';

const metaTags = {
	':Window': true
};

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

export default function tag(parser: Parser) {
	const start = parser.index++;

	let parent = parser.current();

	if (parser.eat('!--')) {
		const data = parser.readUntil(/-->/);
		parser.eat('-->');

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

	if (name in metaTags) {
		if (name in parser.metaTags) {
			if (isClosingTag && parser.current().children.length) {
				parser.error(
					`<${name}> cannot have children`,
					parser.current().children[0].start
				);
			}

			parser.error(`A component can only have one <${name}> tag`, start);
		}

		parser.metaTags[name] = true;

		if (parser.stack.length > 1) {
			parser.error(`<${name}> tags cannot be inside elements or blocks`, start);
		}
	}

	const element: Node = {
		start,
		end: null, // filled in later
		type: 'Element',
		name,
		attributes: [],
		children: [],
	};

	parser.allowWhitespace();

	if (isClosingTag) {
		if (isVoidElementName(name)) {
			parser.error(
				`<${name}> is a void element and cannot have children, or a closing tag`,
				start
			);
		}

		if (!parser.eat('>')) parser.error(`Expected '>'`);

		// close any elements that don't have their own closing tags, e.g. <div><p></div>
		while (parent.name !== name) {
			if (parent.type !== 'Element')
				parser.error(
					`</${name}> attempted to close an element that was not open`,
					start
				);

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
				parser.error(
					`<slot> cannot be a child of an each-block`,
					start
				);
			}
		}
	}

	if (name === SWITCH) {
		parser.eat('{', true);
		element.expression = readExpression(parser);
		parser.allowWhitespace();
		parser.eat('}', true);
		parser.allowWhitespace();
	}

	const uniqueNames = new Set();

	let attribute;
	while ((attribute = readAttribute(parser, uniqueNames))) {
		element.attributes.push(attribute);
		parser.allowWhitespace();
	}

	// special cases – top-level <script> and <style>
	if (specials.has(name) && parser.stack.length === 1) {
		const special = specials.get(name);

		if (parser[special.property]) {
			parser.index = start;
			parser.error(
				`You can only have one top-level <${name}> tag per component`
			);
		}

		parser.eat('>', true);
		parser[special.property] = special.read(parser, start, element.attributes);
		return;
	}

	parser.current().children.push(element);

	const selfClosing = parser.eat('/') || isVoidElementName(name);

	parser.eat('>', true);

	if (selfClosing) {
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
	} else {
		// don't push self-closing elements onto the stack
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
			parser.error(
				`<${SELF}> components can only exist inside if-blocks or each-blocks`,
				start
			);
		}

		return SELF;
	}

	if (parser.eat(SWITCH)) return SWITCH;

	const name = parser.readUntil(/(\s|\/|>)/);

	if (name in metaTags) return name;

	if (!validTagName.test(name)) {
		parser.error(`Expected valid tag name`, start);
	}

	return name;
}

function readAttribute(parser: Parser, uniqueNames: Set<string>) {
	const start = parser.index;

	let name = parser.readUntil(/(\s|=|\/|>)/);
	if (!name) return null;
	if (uniqueNames.has(name)) {
		parser.error('Attributes need to be unique', start);
	}

	uniqueNames.add(name);

	parser.allowWhitespace();

	if (/^on:/.test(name)) {
		return readEventHandlerDirective(parser, start, name.slice(3), parser.eat('='));
	}

	if (/^bind:/.test(name)) {
		return readBindingDirective(parser, start, name.slice(5));
	}

	if (/^ref:/.test(name)) {
		return {
			start,
			end: parser.index,
			type: 'Ref',
			name: name.slice(4),
		};
	}

	const match = /^(in|out|transition):/.exec(name);
	if (match) {
		return readTransitionDirective(
			parser,
			start,
			name.slice(match[0].length),
			match[1]
		);
	}

	let value;

	// :foo is shorthand for foo='{{foo}}'
	if (/^:\w+$/.test(name)) {
		name = name.slice(1);
		value = getShorthandValue(start + 1, name);
	} else {
		value = parser.eat('=') ? readAttributeValue(parser) : true;
	}

	return {
		start,
		end: parser.index,
		type: 'Attribute',
		name,
		value,
	};
}

function readAttributeValue(parser: Parser) {
	const quoteMark = parser.eat(`'`) ? `'` : parser.eat(`"`) ? `"` : null;

	const regex = quoteMark === `'`
		? /'/
		: quoteMark === `"` ? /"/ : /[\s"'=<>\/`]/;

	const value = readSequence(parser, () =>
		regex.test(parser.template[parser.index])
	);

	if (quoteMark) parser.index += 1;
	return value;
}

function getShorthandValue(start: number, name: string) {
	const end = start + name.length;

	return [
		{
			type: 'AttributeShorthand',
			start,
			end,
			expression: {
				type: 'Identifier',
				start,
				end,
				name,
			},
		},
	];
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
		} else if (parser.eat('{{')) {
			if (currentChunk.data) {
				currentChunk.end = index;
				chunks.push(currentChunk);
			}

			const expression = readExpression(parser);
			parser.allowWhitespace();
			if (!parser.eat('}}')) {
				parser.error(`Expected }}`);
			}

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

	parser.error(`Unexpected end of input`);
}
