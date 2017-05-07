import tag from './tag';
import mustache from './mustache';
import text from './text';

export default function fragment ( parser ) {
	if ( parser.match( '<' ) ) {
		return tag;
	}

	if ( parser.match( '{{' ) ) {
		return mustache;
	}

	return text;
}
