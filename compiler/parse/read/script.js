import { parse, tokenizer, tokTypes } from 'acorn';

export default function readScript ( parser, start, attributes ) {
	const scriptStart = parser.index;
	let scriptEnd = null;

	const js = {
		start,
		end: null,
		attributes,
		content: null
	};

	const endPattern = /\s*<\/script\>/g;

	for ( const token of tokenizer( parser.remaining() ) ) {
		endPattern.lastIndex = scriptStart + token.end;
		if ( endPattern.test( parser.template ) ) {
			scriptEnd = scriptStart + token.end;
			break;
		}
	}

	js.content = parse( )
}
