import Node from './shared/Node.js';
import Expression from './shared/Expression.js';
import compiler_errors from '../compiler_errors.js';

/** @extends Node<'Animation'> */
export default class Animation extends Node {
	/** @type {string} */
	name;

	/** @type {import('./shared/Expression.js').default} */
	expression;

	/**
	 * @param {import('../Component.js').default} component  *
	 * @param {import('./Element.js').default} parent  *
	 * @param {import('./shared/TemplateScope.js').default} scope  *
	 * @param {import('../../interfaces.js').TemplateNode} info  undefined
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		component.warn_if_undefined(info.name, info, scope);
		this.name = info.name;
		component.add_reference(/** @type {any} */ (this), info.name.split('.')[0]);
		if (parent.animation) {
			component.error(this, compiler_errors.duplicate_animation);
			return;
		}
		const block = parent.parent;
		if (!block || block.type !== 'EachBlock') {
			// TODO can we relax the 'immediate child' rule?
			component.error(this, compiler_errors.invalid_animation_immediate);
			return;
		}
		if (!block.key) {
			component.error(this, compiler_errors.invalid_animation_key);
			return;
		}
		/** @type {import('./EachBlock.js').default} */ (block).has_animation = true;
		this.expression = info.expression
			? new Expression(component, this, scope, info.expression, true)
			: null;
	}
}
