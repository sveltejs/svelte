import Block from '../dom/Block';
import Node from './shared/Node';
import Expression from './shared/Expression';

export default class Animation extends Node {
	type: 'Animation';
	name: string;
	expression: Expression;

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);

		this.name = info.name;

		this.expression = info.expression
			? new Expression(compiler, this, scope, info.expression)
			: null;
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {

	}
}