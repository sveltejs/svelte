import tag from './tag';
import mustache from './mustache';
import text from './text';
import { Parser } from '../index';

export default function fragment(parser: Parser) {
	if (parser.match('<')) {
		return tag;
	}

	if (parser.match(parser.v2 ? '{' : '{{')) {
		return mustache;
	}

	return text;
}
