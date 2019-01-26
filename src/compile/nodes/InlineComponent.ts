import Node from './shared/Node';
import Attribute from './Attribute';
import mapChildren from './shared/mapChildren';
import Binding from './Binding';
import EventHandler from './EventHandler';
import Expression from './shared/Expression';
import Component from '../Component';
import Let from './Let';
import TemplateScope from './shared/TemplateScope';

export default class InlineComponent extends Node {
	type: 'InlineComponent';
	name: string;
	expression: Expression;
	attributes: Attribute[] = [];
	bindings: Binding[] = [];
	handlers: EventHandler[] = [];
	lets: Let[] = [];
	children: Node[];
	scope: TemplateScope;

	constructor(component: Component, parent, scope, info) {
		super(component, parent, scope, info);

		if (info.name !== 'svelte:component' && info.name !== 'svelte:self') {
			component.warn_if_undefined(info, scope);
			component.template_references.add(info.name);
		}

		this.name = info.name;

		this.expression = this.name === 'svelte:component'
			? new Expression(component, this, scope, info.expression)
			: null;

		info.attributes.forEach(node => {
			switch (node.type) {
				case 'Action':
					component.error(node, {
						code: `invalid-action`,
						message: `Actions can only be applied to DOM elements, not components`
					});

				case 'Attribute':
				case 'Spread':
					this.attributes.push(new Attribute(component, this, scope, node));
					break;

				case 'Binding':
					this.bindings.push(new Binding(component, this, scope, node));
					break;

				case 'Class':
					component.error(node, {
						code: `invalid-class`,
						message: `Classes can only be applied to DOM elements, not components`
					});

				case 'EventHandler':
					this.handlers.push(new EventHandler(component, this, scope, node));
					break;

				case 'Let':
					this.lets.push(new Let(component, this, scope, node));
					break;

				case 'Transition':
					component.error(node, {
						code: `invalid-transition`,
						message: `Transitions can only be applied to DOM elements, not components`
					});

				default:
					throw new Error(`Not implemented: ${node.type}`);
			}
		});

		if (this.lets.length > 0) {
			this.scope = scope.child();

			this.lets.forEach(l => {
				const dependencies = new Set([l.name]);

				l.names.forEach(name => {
					this.scope.add(name, dependencies, this);
				});
			});
		} else {
			this.scope = scope;
		}

		this.children = mapChildren(component, this, this.scope, info.children);
	}
}
