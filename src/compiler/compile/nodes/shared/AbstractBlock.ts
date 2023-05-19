import Node from './Node.js';
import compiler_warnings from '../../compiler_warnings.js';

const regex_non_whitespace_characters = /[^ \r\n\f\v\t]/;

/**
 * @template {string} Type
 * @extends Node<Type>
 */
export default class AbstractBlock extends Node {
	/** @type {import('../../render_dom/Block.js').default} */
	block;

	/** @type {import('../interfaces.js').INode[]} */
	children;

	/**
	 * @param {import('../../Component.js').default} component
	 * @param {any} parent
	 * @param {any} scope
	 * @param {any} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
	}
	warn_if_empty_block() {
		if (!this.children || this.children.length > 1) return;
		const child = this.children[0];
		if (!child || (child.type === 'Text' && !regex_non_whitespace_characters.test(child.data))) {
			this.component.warn(this, compiler_warnings.empty_block);
		}
	}
}
