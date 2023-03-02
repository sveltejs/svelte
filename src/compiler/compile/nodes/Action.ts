import Node from './shared/Node';
import Expression from './shared/Expression';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { Directive } from '../../interfaces';

export default class Action extends Node {
	type: 'Action';
	name: string;
	expression: Expression;
	uses_context: boolean;
	template_scope: TemplateScope;

	constructor(component: Component, parent: Node, scope: TemplateScope, info: Directive) {
		super(component, parent, scope, info);

		const object = info.name.split('.')[0];
		component.warn_if_undefined(object, info, scope);

		this.name = info.name;
		component.add_reference(this as any, object);

		this.expression = info.expression
			? new Expression(component, this, scope, info.expression)
			: null;

		this.template_scope = scope;

		this.uses_context = this.expression && this.expression.uses_context;
	}
}
