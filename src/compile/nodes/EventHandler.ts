import Node from './shared/Node';
import Expression from './shared/Expression';
import flattenReference from '../../utils/flattenReference';
import { createScopes } from '../../utils/annotateWithScopes';
import { walk } from 'estree-walker';
import Component from '../Component';
import deindent from '../../utils/deindent';

export default class EventHandler extends Node {
	name: string;
	modifiers: Set<string>;
	expression: Expression;
	callee: any; // TODO

	usesComponent: boolean;
	usesContext: boolean;
	usesEventObject: boolean;
	isCustomEvent: boolean;

	insertionPoint: number;
	args: Expression[];
	snippet: string;

	constructor(component: Component, parent, template_scope, info) {
		super(component, parent, template_scope, info);

		this.name = info.name;
		this.modifiers = new Set(info.modifiers);

		if (info.expression) {
			this.expression = new Expression(component, this, template_scope, info.expression, true);
			this.snippet = this.expression.snippet;

			this.usesContext = this.expression.usesContext;
		} else {
			component.init_uses_self = true;

			const name = component.getUniqueName(`${this.name}_handler`);
			component.declarations.push(name);

			component.partly_hoisted.push(deindent`
				function ${name}(event) {
					@bubble($$self, event);
				}
			`);

			this.snippet = `ctx.${name}`;
		}

		// TODO figure out what to do about custom events
		// this.isCustomEvent = component.events.has(this.name);
	}
}