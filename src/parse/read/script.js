import { parse, tokenizer } from 'acorn';
import spaces from '../../utils/spaces.js';

export default function readScript ( parser, start, attributes ) {
	const scriptStart = parser.index;
	let scriptEnd = null;

	for ( const token of tokenizer( parser.remaining() ) ) {
		parser.index = scriptStart + token.end;
		parser.allowWhitespace();

		scriptEnd = parser.index;

		if ( parser.eat( '/script>' ) ) {
			// this happens with trailing comments!
			scriptEnd -= 1;
			break;
		}

		if ( parser.eat( '<\/script>' ) ) {
			break;
		}
	}

	const source = spaces( scriptStart ) + parser.template.slice( scriptStart, scriptEnd );

	let ast;

	try {
		ast = parse( source, {
			ecmaVersion: 8,
			sourceType: 'module'
		});
	} catch ( err ) {
		parser.acornError( err );
	}

	if ( !ast.body.length ) return null;

	ast.start = scriptStart;

	return {
		start,
		end: parser.index,
		attributes,
		content: ast
	};
}
