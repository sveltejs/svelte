import Node from './shared/Node';
import Expression from './shared/Expression';

export default class Transition extends Node {
	type: 'Transition';
	name: string;
	expression: Expression;

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);

		this.name = info.name;

		this.expression = info.expression
			? new Expression(compiler, this, scope, info.expression)
			: null;
	}
}