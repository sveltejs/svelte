import tag from './tag.js';
import mustache from './mustache.js';
import text from './text.js';

export default function fragment ( parser ) {
	parser.allowWhitespace();

	if ( parser.match( '<' ) ) {
		return tag;
	}

	if ( parser.match( '{{' ) ) {
		return mustache;
	}

	return text;
}
