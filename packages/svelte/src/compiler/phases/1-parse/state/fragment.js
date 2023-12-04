import element from './element.js';
import tag from './tag.js';
import text from './text.js';

/** @param {import('../index.js').Parser} parser */
export default function fragment(parser) {
	if (parser.match('<')) {
		return element;
	}

	if (parser.match('{')) {
		return tag;
	}

	return text;
}
