import Node from './Node.js';
import Expression from './Expression.js';

/**
 * @template {'MustacheTag' | 'RawMustacheTag'} [Type='MustacheTag' | 'RawMustacheTag']
 * @extends Node<Type>
 */
export default class Tag extends Node {
	/** @type {import('./Expression.js').default} */
	expression;

	/** @type {boolean} */
	should_cache;

	/**
	 * @param {any} component
	 * @param {any} parent
	 * @param {any} scope
	 * @param {any} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		component.tags.push(this);
		this.cannot_use_innerhtml();
		this.expression = new Expression(component, this, scope, info.expression);
		this.should_cache =
			info.expression.type !== 'Identifier' ||
			(this.expression.dependencies.size && scope.names.has(info.expression.name));
	}
	is_dependencies_static() {
		return (
			this.expression.dynamic_contextual_dependencies().length === 0 &&
			this.expression.dynamic_dependencies().length === 0
		);
	}
	check_if_content_dynamic() {
		if (!this.is_dependencies_static()) {
			this.not_static_content();
		}
	}
}
