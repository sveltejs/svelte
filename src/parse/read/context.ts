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
	type: 'Identifier' | 'ArrayPattern' | 'ObjectPattern' | 'RestIdentifier';
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

function error_on_rest_pattern_not_last(parser: Parser) {
	parser.error({
		code: 'rest-pattern-not-last',
		message: 'Rest destructuring expected to be last'
	}, parser.index);
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

			const lastContext = context.elements[context.elements.length - 1];
			if (lastContext && lastContext.type === 'RestIdentifier') {
				error_on_rest_pattern_not_last(parser);
			}

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

	else if (parser.eat('...')) {
		const name = parser.read_identifier();
		if (name) {
			context.type = 'RestIdentifier';
			context.end = parser.index;
			context.name = name;
		}

		else {
			parser.error({
				code: 'invalid-context',
				message: 'Expected a rest pattern'
			});
		}
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
