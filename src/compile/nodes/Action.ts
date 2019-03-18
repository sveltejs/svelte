import Node from './shared/Node';
import Expression from './shared/Expression';
import Component from '../Component';

export default class Action extends Node {
	type: 'Action';
	name: string;
	expression: Expression;
	uses_context: boolean;

	constructor(component: Component, parent, scope, info) {
		super(component, parent, scope, info);

		component.warn_if_undefined(info, scope);

		this.name = info.name;
		component.qualify(info.name);

		this.expression = info.expression
			? new Expression(component, this, scope, info.expression)
			: null;

		this.uses_context = this.expression && this.expression.uses_context;
	}
}