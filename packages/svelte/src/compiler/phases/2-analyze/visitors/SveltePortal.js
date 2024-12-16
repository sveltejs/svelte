/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { visit_component } from './shared/component.js';
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';
import { filename } from '../../../state.js';

/**
 * @param {AST.SveltePortal} node
 * @param {Context} context
 */
export function SveltePortal(node, context) {
	// TODO validation for attributes etc
	context.next();
}
