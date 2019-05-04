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
	kind: 'init' | 'rest';
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

function error_on_assignment_pattern(parser: Parser) {
	if (parser.eat('=')) {
		parser.error({
			code: 'invalid-assignment-pattern',
			message: 'Assignment patterns are not supported'
		}, parser.index - 1);
	}
}

export default function read_context(parser: Parser) {
	const context: Context = {
		start: parser.index,
		end: null,
		type: null
	};

	if (parser.eat('[')) {
		context.type = 'ArrayPattern';
		context.elements = [];

		do {
			parser.allow_whitespace();

			if (parser.template[parser.index] === ',') {
				context.elements.push(null);
			} else {
				context.elements.push(read_context(parser));
				parser.allow_whitespace();
			}
		} while (parser.eat(','));

		error_on_assignment_pattern(parser);
		parser.eat(']', true);
		context.end = parser.index;
	}

	else if (parser.eat('{')) {
		context.type = 'ObjectPattern';
		context.properties = [];

		do {
			parser.allow_whitespace();

			if (parser.eat('...')) {
				parser.allow_whitespace();

				const start = parser.index;
				const name = parser.read_identifier();
				const key: Identifier = {
					start,
					end: parser.index,
					type: 'Identifier',
					name
				}
				const property: Property = {
					start,
					end: parser.index,
					type: 'Property',
					kind: 'rest',
					shorthand: true,
					key,
					value: key
				}

				context.properties.push(property);

				parser.allow_whitespace();

				if (parser.eat(',')) {
					parser.error({
						code: `comma-after-rest`,
						message: `Comma is not permitted after the rest element`
					}, parser.index - 1);
				}

				break;
			}

			const start = parser.index;
			const name = parser.read_identifier();
			const key: Identifier = {
				start,
				end: parser.index,
				type: 'Identifier',
				name
			};
			parser.allow_whitespace();

			const value = parser.eat(':')
				? (parser.allow_whitespace(), read_context(parser))
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

			parser.allow_whitespace();
		} while (parser.eat(','));

		error_on_assignment_pattern(parser);
		parser.eat('}', true);
		context.end = parser.index;
	}

	else {
		const name = parser.read_identifier();
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

		error_on_assignment_pattern(parser);
	}

	return context;
}
