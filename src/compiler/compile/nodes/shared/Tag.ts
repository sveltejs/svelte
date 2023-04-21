import Node from './Node';
import Expression from './Expression';

export default class Tag extends Node {
	type: 'MustacheTag' | 'RawMustacheTag';
	expression: Expression;
	should_cache: boolean;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		component.tags.push(this);
		this.cannot_use_innerhtml();

		this.expression = new Expression(component, this, scope, info.expression);

		this.should_cache = (
			info.expression.type !== 'Identifier' ||
			(this.expression.dependencies.size && scope.names.has(info.expression.name))
		);
	}
	is_dependencies_static() {
		return this.expression.dynamic_contextual_dependencies().length === 0 && this.expression.dynamic_dependencies().length === 0;
	}
	check_if_content_dynamic() {
		if (!this.is_dependencies_static()) {
			this.not_static_content();
		}
	}
}
