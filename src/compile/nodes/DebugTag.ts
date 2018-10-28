import Node from './shared/Node';
import Expression from './shared/Expression';

export default class DebugTag extends Node {
	expressions: Expression[];

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.expressions = info.identifiers.map(node => {
			return new Expression(component, parent, scope, node);
		});
	}
}