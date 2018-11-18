import Node from './shared/Node';
import PendingBlock from './PendingBlock';
import ThenBlock from './ThenBlock';
import CatchBlock from './CatchBlock';
import Expression from './shared/Expression';

export default class AwaitBlock extends Node {
	expression: Expression;
	value: string;
	error: string;

	pending: PendingBlock;
	then: ThenBlock;
	catch: CatchBlock;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);

		this.value = info.value;
		this.error = info.error;

		this.pending = new PendingBlock(component, this, scope, info.pending);
		this.then = new ThenBlock(component, this, scope, info.then);
		this.catch = new CatchBlock(component, this, scope, info.catch);
	}
}
