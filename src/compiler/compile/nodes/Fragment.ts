import Node from './shared/Node.js';
import map_children from './shared/map_children.js';
import TemplateScope from './shared/TemplateScope.js';

/** @extends Node<'Fragment'> */
export default class Fragment extends Node {
	/** @type {import('../render_dom/Block.js').default} */
	block;

	/** @type {import('./interfaces.js').INode[]} */
	children;

	/** @type {import('./shared/TemplateScope.js').default} */
	scope;

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, info) {
		const scope = new TemplateScope();
		super(component, null, scope, info);
		this.scope = scope;
		this.children = map_children(component, this, scope, info.children);
	}
}
