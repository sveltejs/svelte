import Node from './shared/Node.js';
import map_children from './shared/map_children.js';
import compiler_errors from '../compiler_errors.js';

/** @extends Node<'Title'> */
export default class Title extends Node {
	/** @type {import('./shared/map_children.js').Children} */
	children;

	/** @type {boolean} */
	should_cache;

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./shared/Node.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.children = map_children(component, parent, scope, info.children);
		if (info.attributes.length > 0) {
			component.error(info.attributes[0], compiler_errors.illegal_attribute_title);
			return;
		}
		info.children.forEach(
			/** @param {any} child */ (child) => {
				if (child.type !== 'Text' && child.type !== 'MustacheTag') {
					return component.error(child, compiler_errors.illegal_structure_title);
				}
			}
		);
		this.should_cache =
			info.children.length === 1
				? info.children[0].type !== 'Identifier' || scope.names.has(info.children[0].name)
				: true;
	}
}
