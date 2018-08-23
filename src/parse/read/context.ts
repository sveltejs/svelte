import { Parser } from '../index';

type Identifier = {
	start: number;
	end: number;
	type: 'Identifier';
	name: string;
};

type Property = {
	start: number;
	end: number;
	type: 'Property';
	kind: string;
	shorthand: boolean;
	key: Identifier;
	value: Context;
};

type Context = {
	start: number;
	end: number;
	type: 'Identifier' | 'ArrayPattern' | 'ObjectPattern';
	name?: string;
	elements?: Context[];
	properties?: Property[];
}

function errorOnAssignmentPattern(parser: Parser) {
	if (parser.eat('=')) {
		parser.error({
			code: 'invalid-assignment-pattern',
			message: 'Assignment patterns are not supported'
		}, parser.index - 1);
	}
}

export default function readContext(parser: Parser) {
	const context: Context = {
		start: parser.index,
		end: null,
		type: null
	};

	if (parser.eat('[')) {
		context.type = 'ArrayPattern';
		context.elements = [];

		do {
			parser.allowWhitespace();

			if (parser.template[parser.index] === ',') {
				context.elements.push(null);
			} else {
				context.elements.push(readContext(parser));
				parser.allowWhitespace();
			}
		} while (parser.eat(','));

		errorOnAssignmentPattern(parser);
		parser.eat(']', true);
		context.end = parser.index;
	}

	else if (parser.eat('{')) {
		context.type = 'ObjectPattern';
		context.properties = [];

		do {
			parser.allowWhitespace();

			const start = parser.index;
			const name = parser.readIdentifier();
			const key: Identifier = {
				start,
				end: parser.index,
				type: 'Identifier',
				name
			};
			parser.allowWhitespace();

			const value = parser.eat(':')
				? (parser.allowWhitespace(), readContext(parser))
				: key;

			const property: Property = {
				start,
				end: value.end,
				type: 'Property',
				kind: 'init',
				shorthand: value.type === 'Identifier' && value.name === name,
				key,
				value
			};

			context.properties.push(property);

			parser.allowWhitespace();
		} while (parser.eat(','));

		errorOnAssignmentPattern(parser);
		parser.eat('}', true);
		context.end = parser.index;
	}

	else {
		const name = parser.readIdentifier();
		if (name) {
			context.type = 'Identifier';
			context.end = parser.index;
			context.name = name;
		}

		else {
			parser.error({
				code: 'invalid-context',
				message: 'Expected a name, array pattern or object pattern'
			});
		}

		errorOnAssignmentPattern(parser);
	}

	return context;
}