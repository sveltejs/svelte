/** @import { AST } from '#compiler' */
/** @import { Parser } from '../index.js' */
import { locator } from '../../../state.js';

/**
 * @param {Parser} parser
 * @returns {AST.JSComment | null}
 */
export function read_comment(parser) {
	const start = parser.index;

	if (parser.eat('//')) {
		const value = parser.read_until(/\n/);
		const end = parser.index;

		return {
			type: 'Line',
			start,
			end,
			value,
			loc: {
				start: locator(start),
				end: locator(end)
			}
		};
	}

	if (parser.eat('/*')) {
		const value = parser.read_until(/\*\//);

		parser.eat('*/');
		const end = parser.index;

		return {
			type: 'Block',
			start,
			end,
			value,
			loc: {
				start: locator(start),
				end: locator(end)
			}
		};
	}

	return null;
}
