import Node from './Node';
import Expression from './Expression';

export default class Tag extends Node {
	expression: Expression;
	shouldCache: boolean;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.expression = new Expression(component, this, scope, info.expression);

		this.shouldCache = (
			info.expression.type !== 'Identifier' ||
			(this.expression.dependencies.size && scope.names.has(info.expression.name))
		);
	}
}