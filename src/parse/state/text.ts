import { decodeCharacterReferences } from '../utils/html';
import { Parser } from '../index';

export default function text ( parser: Parser ) {
	const start = parser.index;

	let data = '';

	while ( parser.index < parser.template.length && !parser.match( '<' ) && !parser.match( '{{' ) ) {
		data += parser.template[ parser.index++ ];
	}

	parser.current().children.push({
		start,
		end: parser.index,
		type: 'Text',
		data: decodeCharacterReferences( data )
	});

	return null;
}
