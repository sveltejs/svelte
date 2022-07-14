import { Parser } from '../index';
import mustache from './mustache';
import tag from './tag';
import text from './text';

export default function fragment(parser: Parser) {
	return (
		[
			{ match: '<', fragment: tag },
			{ match: '{', fragment: mustache }
		].find(({ match }) => parser.match(match))?.fragment ?? text
	);
}
