/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {any} node
 * @param {Context} context
 */
export function TSModuleDeclaration(node, context) {
	e.typescript_invalid_feature(node, 'namespaces with non-type nodes');
}
