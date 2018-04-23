import Node from './shared/Node';
import Expression from './shared/Expression';

export default class Transition extends Node {
	type: 'Transition';
	name: string;
	expression: Expression;

	constructor(compiler, parent, info) {
		super(compiler, parent, info);

		this.name = info.name;

		this.expression = info.expression
			? new Expression(compiler, this, info.expression)
			: null;
	}
}