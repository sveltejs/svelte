import { parseExpressionAt } from 'acorn';

export default function readExpression ( parser ) {
	const start = parser.index;

	parser.index = start;

	try {
		const node = parseExpressionAt( parser.template, parser.index );
		parser.index = node.end;

		return node;
	} catch ( err ) {
		const name = parser.readUntil( /\s*}}/ );
		if ( name && /^[a-z]+$/.test( name ) ) {
			return {
				type: 'Identifier',
				start,
				end: start + name.length,
				name
			};
		}
		parser.acornError( err );
	}
}
