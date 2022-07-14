import { Parser } from "../index";
import mustache from "./mustache";
import tag from "./tag";
import text from "./text";

export default (parser: Parser) =>
	[
		{ match: "<", fragment: tag },
		{ match: "{", fragment: mustache },
	].find(({ match }) => parser.match(match))?.fragment ?? text;
