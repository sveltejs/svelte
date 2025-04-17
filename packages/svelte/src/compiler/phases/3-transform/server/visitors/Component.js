/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { build_inline_component } from './shared/component.js';

/**
 * @param {AST.Component} node
 * @param {ComponentContext} context
 */
export function Component(node, context) {
	build_inline_component(node, b.id(node.name), context);
}
