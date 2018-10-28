import Node from './shared/Node';
import Expression from './shared/Expression';

export default class Class extends Node {
	type: 'Class';
	name: string;
	expression: Expression;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.name = info.name;

		this.expression = info.expression
			? new Expression(component, this, scope, info.expression)
			: null;
	}
}