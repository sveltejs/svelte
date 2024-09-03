/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {any} node
 * @param {Context} context
 */
export function PropertyDefinition(node, context) {
	// acorn plugin adds this field
	if (node.accessor) {
		e.typescript_invalid_feature(node, 'accessor fields (related TSC proposal is not stage 4 yet)');
	}
}
