import { parseExpressionAt } from 'acorn';

const literals = {
	true: true,
	false: false,
	null: null
};

export default function readExpression ( parser ) {
	const start = parser.index;

	const name = parser.readUntil( /\s*}}/ );
	if ( name && /^[a-z]+$/.test( name ) ) {
		const end = start + name.length;

		if ( name in literals ) {
			return {
				type: 'Literal',
				start,
				end,
				value: literals[ name ],
				raw: name
			};
		}

		return {
			type: 'Identifier',
			start,
			end: start + name.length,
			name
		};
	}

	parser.index = start;

	try {
		const node = parseExpressionAt( parser.template, parser.index );
		parser.index = node.end;

		return node;
	} catch ( err ) {
		parser.acornError( err );
	}
}
