import { parse, tokenizer } from 'acorn';

function spaces ( i ) {
	let result = '';
	while ( i-- ) result += ' ';
	return result;
}

export default function readScript ( parser, start, attributes ) {
	const scriptStart = parser.index;
	let scriptEnd = null;

	for ( const token of tokenizer( parser.remaining() ) ) {
		parser.index = scriptStart + token.end;
		parser.allowWhitespace();

		if ( parser.eat( '</script>' )  ) {
			scriptEnd = scriptStart + token.end;
			break;
		}
	}

	const source = spaces( scriptStart ) + parser.template.slice( scriptStart, scriptEnd );

	const ast = parse( source, {
		ecmaVersion: 8,
		sourceType: 'module'
	});

	ast.start = scriptStart;

	return {
		start,
		end: parser.index,
		attributes,
		content: ast
	};
}
