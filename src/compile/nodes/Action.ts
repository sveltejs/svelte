import Node from './shared/Node';
import Expression from './shared/Expression';

export default class Action extends Node {
	type: 'Action';
	name: string;
	expression: Expression;
	usesContext: boolean;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.name = info.name;

		this.expression = info.expression
			? new Expression(component, this, scope, info.expression)
			: null;

		this.usesContext = this.expression && this.expression.usesContext;
	}
}