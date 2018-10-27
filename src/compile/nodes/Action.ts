import Node from './shared/Node';
import Expression from './shared/Expression';

export default class Action extends Node {
	type: 'Action';
	name: string;
	expression: Expression;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.name = info.name;

		component.used.actions.add(this.name);

		if (!component.actions.has(this.name)) {
			component.error(this, {
				code: `missing-action`,
				message: `Missing action '${this.name}'`
			});
		}

		this.expression = info.expression
			? new Expression(component, this, scope, info.expression)
			: null;
	}
}