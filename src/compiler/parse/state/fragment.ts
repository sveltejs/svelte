import tag from './tag.ts';
import mustache from './mustache.ts';
import text from './text.ts';
import { Parser } from '../index.ts';

export default function fragment(parser: Parser) {
	if (parser.match('<')) {
		return tag;
	}

	if (parser.match('{')) {
		return mustache;
	}

	return text;
}
