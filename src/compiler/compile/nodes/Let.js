import Node from './shared/Node.js';
import { walk } from 'estree-walker';
import compiler_errors from '../compiler_errors.js';

const applicable = new Set(['Identifier', 'ObjectExpression', 'ArrayExpression', 'Property']);

/** @extends Node<'Let'> */
export default class Let extends Node {
	/** @type {import('estree').Identifier} */
	name;

	/** @type {import('estree').Identifier} */
	value;

	/** @type {string[]} */
	names = [];

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./shared/Node.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.name = { type: 'Identifier', name: info.name };
		const { names } = this;
		if (info.expression) {
			this.value = info.expression;
			walk(info.expression, {
				/** @param {import('estree').Identifier | import('estree').BasePattern} node */
				enter(node) {
					if (!applicable.has(node.type)) {
						return component.error(/** @type {any} */ (node), compiler_errors.invalid_let);
					}
					if (node.type === 'Identifier') {
						names.push(/** @type {import('estree').Identifier} */ (node).name);
					}
					// slightly unfortunate hack
					if (node.type === 'ArrayExpression') {
						node.type = 'ArrayPattern';
					}
					if (node.type === 'ObjectExpression') {
						node.type = 'ObjectPattern';
					}
				}
			});
		} else {
			names.push(this.name.name);
		}
	}
}
