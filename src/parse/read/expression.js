import { parseExpressionAt } from 'acorn';

export default function readExpression ( parser ) {
	const start = parser.index;

	const name = parser.readUntil( /\s*}}/ );
	if ( name && /^\w+$/.test( name ) ) {
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
