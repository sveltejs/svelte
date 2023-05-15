import Node from './shared/Node.js';
import Expression from './shared/Expression.js';

/** @extends Node<'Action'> */
export default class Action extends Node {
	/** @type {string} */
	name;

	/** @type {import('./shared/Expression.js').default} */
	expression;

	/** @type {boolean} */
	uses_context;

	/** @type {import('./shared/TemplateScope.js').default} */
	template_scope;

	/**
	 * @param {import('../Component.js').default} component  *
	 * @param {import('./shared/Node.js').default} parent  *
	 * @param {import('./shared/TemplateScope.js').default} scope  *
	 * @param {import('../../interfaces.js').Directive} info  undefined
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		const object = info.name.split('.')[0];
		component.warn_if_undefined(object, info, scope);
		this.name = info.name;
		component.add_reference(/** @type {any} */ (this), object);
		this.expression = info.expression
			? new Expression(component, this, scope, info.expression)
			: null;
		this.template_scope = scope;
		this.uses_context = this.expression && this.expression.uses_context;
	}
}
