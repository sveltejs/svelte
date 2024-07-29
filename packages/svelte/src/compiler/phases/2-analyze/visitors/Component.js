/** @import { Component } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_component } from './shared/component.js';

/**
 * @param {Component} node
 * @param {Context} context
 */
export function Component(node, context) {
	validate_component(node, context);
}
