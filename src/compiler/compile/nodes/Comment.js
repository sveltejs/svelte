import Node from './shared/Node.js';

/** @extends Node */
export default class Comment extends Node {
	/** @type {'Comment'} */
	type;

	/** @type {string} */
	data;

	/** @type {string[]} */
	ignores;

	/**
	 * @param {import('../Component.js').default} component  *
	 * @param {import('./shared/Node.js').default} parent  *
	 * @param {import('./shared/TemplateScope.js').default} scope  *
	 * @param {import('../../interfaces.js').TemplateNode} info  undefined
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.data = info.data;
		this.ignores = info.ignores;
	}
}
