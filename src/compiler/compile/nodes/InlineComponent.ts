import Node from './shared/Node';
import Attribute from './Attribute';
import map_children from './shared/map_children';
import Binding from './Binding';
import EventHandler from './EventHandler';
import Expression from './shared/Expression';
import Component from '../Component';
import Let from './Let';
import TemplateScope from './shared/TemplateScope';
import { INode } from './interfaces';
import { TemplateNode } from '../../interfaces';
import compiler_errors from '../compiler_errors';

export default class InlineComponent extends Node {
	type: 'InlineComponent';
	name: string;
	expression: Expression;
	attributes: Attribute[] = [];
	bindings: Binding[] = [];
	handlers: EventHandler[] = [];
	lets: Let[] = [];
	css_custom_properties: Attribute[] = [];
	children: INode[];
	scope: TemplateScope;

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		if (info.name !== 'svelte:component' && info.name !== 'svelte:self') {
			const name = info.name.split('.')[0]; // accommodate namespaces
			component.warn_if_undefined(name, info, scope);
			component.add_reference(name);
		}

		this.name = info.name;

		this.expression = this.name === 'svelte:component'
			? new Expression(component, this, scope, info.expression)
			: null;

		info.attributes.forEach(node => {
			/* eslint-disable no-fallthrough */
			switch (node.type) {
				case 'Action':
					return component.error(node, compiler_errors.invalid_action);

				case 'Attribute':
					if (node.name.startsWith('--')) {
						this.css_custom_properties.push(new Attribute(component, this, scope, node));
						break;
					}
					// fallthrough
				case 'Spread':
					this.attributes.push(new Attribute(component, this, scope, node));
					break;

				case 'Binding':
					this.bindings.push(new Binding(component, this, scope, node));
					break;

				case 'Class':
					return component.error(node, compiler_errors.invalid_class);

				case 'EventHandler':
					this.handlers.push(new EventHandler(component, this, scope, node));
					break;

				case 'Let':
					this.lets.push(new Let(component, this, scope, node));
					break;

				case 'Transition':
					return component.error(node, compiler_errors.invalid_transition);

				default:
					throw new Error(`Not implemented: ${node.type}`);
			}
			/* eslint-enable no-fallthrough */
		});

		if (this.lets.length > 0) {
			this.scope = scope.child();

			this.lets.forEach(l => {
				const dependencies = new Set([l.name.name]);

				l.names.forEach(name => {
					this.scope.add(name, dependencies, this);
				});
			});
		} else {
			this.scope = scope;
		}

		this.handlers.forEach(handler => {
			handler.modifiers.forEach(modifier => {
				if (modifier !== 'once') {
					return component.error(handler, compiler_errors.invalid_event_modifier_component);
				}
			});
		});

		const children = [];
		for (let i = info.children.length - 1; i >= 0; i--) {
			const child = info.children[i];
			if (child.type === 'SlotTemplate') {
				children.push(child);
				info.children.splice(i, 1);
			} else if ((child.type === 'Element' || child.type === 'InlineComponent' || child.type === 'Slot') && child.attributes.find(attribute => attribute.name === 'slot')) {
				const slot_template = {
					start: child.start,
					end: child.end,
					type: 'SlotTemplate',
					name: 'svelte:fragment',
					attributes: [],
					children: [child]
				};

				// transfer attributes
				for (let i = child.attributes.length - 1; i >= 0; i--) {
					const attribute = child.attributes[i];
					if (attribute.type === 'Let') {
						slot_template.attributes.push(attribute);
						child.attributes.splice(i, 1);
					} else if (attribute.type === 'Attribute' && attribute.name === 'slot') {
						slot_template.attributes.push(attribute);
					}
				}
		
				children.push(slot_template);
				info.children.splice(i, 1);
			}
		}

		if (info.children.some(node => not_whitespace_text(node))) {
			children.push({ 
				start: info.start,
				end: info.end,
				type: 'SlotTemplate', 
				name: 'svelte:fragment',
				attributes: [],
				children: info.children
			});
		}

		this.children = map_children(component, this, this.scope, children);
	}

	get slot_template_name() {
		return this.attributes.find(attribute => attribute.name === 'slot').get_static_value() as string;
	}
}

function not_whitespace_text(node) {
	return !(node.type === 'Text' && /^\s+$/.test(node.data));
}
