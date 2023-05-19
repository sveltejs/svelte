import Node from './shared/Node.js';
import map_children from './shared/map_children.js';
import hash from '../utils/hash.js';
import compiler_errors from '../compiler_errors.js';
import { regex_non_whitespace_character } from '../../utils/patterns.js';

/** @extends Node<'Head'> */
export default class Head extends Node {
	/** @type {any[]} */
	children; // TODO

	/** @type {string} */
	id;

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./shared/Node.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.cannot_use_innerhtml();
		if (info.attributes.length) {
			component.error(info.attributes[0], compiler_errors.invalid_attribute_head);
			return;
		}
		this.children = map_children(
			component,
			parent,
			scope,
			info.children.filter(
				/** @param {any} child */ (child) => {
					return child.type !== 'Text' || regex_non_whitespace_character.test(child.data);
				}
			)
		);
		if (this.children.length > 0) {
			this.id = `svelte-${hash(this.component.source.slice(this.start, this.end))}`;
		}
	}
}
