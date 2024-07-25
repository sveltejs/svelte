/** @import { Component } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import { serialize_inline_component } from './shared/component.js';

/**
 * @param {Component} node
 * @param {ComponentContext} context
 */
export function Component(node, context) {
	serialize_inline_component(node, b.id(node.name), context);
}
