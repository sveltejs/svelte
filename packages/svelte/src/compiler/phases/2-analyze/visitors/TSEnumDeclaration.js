/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {any} node
 * @param {Context} context
 */
export function TSEnumDeclaration(node, context) {
	e.typescript_invalid_feature(node, 'enums');
}
