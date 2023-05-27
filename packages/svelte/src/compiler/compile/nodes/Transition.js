import Node from './shared/Node.js';
import Expression from './shared/Expression.js';
import compiler_errors from '../compiler_errors.js';

/** @extends Node<'Transition'> */
export default class Transition extends Node {
	/** @type {string} */
	name;

	/** @type {string} */
	directive;

	/** @type {import('./shared/Expression.js').default} */
	expression;

	/** @type {boolean} */
	is_local;

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./Element.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		component.warn_if_undefined(info.name, info, scope);
		this.name = info.name;
		component.add_reference(/** @type {any} */ (this), info.name.split('.')[0]);
		this.directive = info.intro && info.outro ? 'transition' : info.intro ? 'in' : 'out';
		this.is_local = !info.modifiers.includes('global');
		if ((info.intro && parent.intro) || (info.outro && parent.outro)) {
			const parent_transition = parent.intro || parent.outro;
			component.error(
				info,
				compiler_errors.duplicate_transition(this.directive, parent_transition.directive)
			);
			return;
		}
		this.expression = info.expression
			? new Expression(component, this, scope, info.expression)
			: null;
	}
}
