import Node from './Node';
import Expression from './Expression';

export default class Tag extends Node {
	expression: Expression;
	should_cache: boolean;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.expression = new Expression(component, this, scope, info.expression);

		this.should_cache = (
			(info.expression.type !== 'Identifier' || (this.expression.dependencies.size && scope.names.has(info.expression.name))) &&
			!this.contains_mutable_expression()
		);
	}

	contains_mutable_expression() {
		const { node: expression } = this.expression;

		if (expression.type !== 'MemberExpression') return false;

		const { name } = expression.object;
		const variable = this.component.var_lookup.get(name);

		return variable && variable.mutated;
	}
}
