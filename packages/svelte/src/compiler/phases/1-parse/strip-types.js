import { walk } from 'zimmerframe';
import * as b from '../../utils/builders.js';

/**
 * @param {string} source
 * @param {import('estree').Node} node
 */
export function strip_types(source, node) {
	return walk(node, null, {
		_(node, context) {
			// @ts-expect-error
			delete node.loc.start.index;
			// @ts-expect-error
			delete node.loc.end.index;

			if (/** @type {any} */ (node).typeAnnotation && node.end === undefined) {
				// i think there might be a bug in acorn-typescript that prevents
				// `end` from being assigned when there's a type annotation
				let end = /** @type {any} */ (node).typeAnnotation.start;
				while (/\s/.test(source[end - 1])) end -= 1;
				node.end = end;
			}

			context.next();
		}
	});
}
