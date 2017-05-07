import tag from './tag.ts';
import mustache from './mustache.ts';
import text from './text.ts';

export default function fragment ( parser ) {
	if ( parser.match( '<' ) ) {
		return tag;
	}

	if ( parser.match( '{{' ) ) {
		return mustache;
	}

	return text;
}
