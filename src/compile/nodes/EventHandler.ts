import Node from './shared/Node';
import Expression from './shared/Expression';
import Component from '../Component';
import deindent from '../../utils/deindent';

export default class EventHandler extends Node {
	name: string;
	modifiers: Set<string>;
	expression: Expression;
	handler_name: string;
	usesContext: boolean;

	constructor(component: Component, parent, template_scope, info) {
		super(component, parent, template_scope, info);

		this.name = info.name;
		this.modifiers = new Set(info.modifiers);

		if (info.expression) {
			this.expression = new Expression(component, this, template_scope, info.expression);
			this.usesContext = this.expression.usesContext;
		} else {
			const name = component.getUniqueName(`${this.name}_handler`);
			component.declarations.push(name);

			component.partly_hoisted.push(deindent`
				function ${name}(event) {
					@bubble($$self, event);
				}
			`);

			this.handler_name = name;
		}
	}

	render() {
		if (this.expression) return this.expression.render();

		this.component.template_references.add(this.handler_name);
		return `ctx.${this.handler_name}`;
	}
}