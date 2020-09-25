import Node from './shared/Node';
import Attribute from './Attribute';
import Binding from './Binding';
import EventHandler from './EventHandler';
import Let from './Let';
import TemplateScope from './shared/TemplateScope';
import { INode } from './interfaces';
import Expression from './shared/Expression';
import Component from '../Component';
import map_children from './shared/map_children';
import Class from './Class';
import Transition from './Transition';
import Animation from './Animation';
import Action from './Action';
import { string_literal } from '../utils/stringify';
import { Literal } from 'estree';

export default class DynamicElement extends Node {
	type: 'DynamicElement';
	name: string;
	tag: Expression;
	attributes: Attribute[] = [];
	actions: Action[] = [];
	bindings: Binding[] = [];
	classes: Class[] = [];
	handlers: EventHandler[] = [];
	lets: Let[] = [];
	intro?: Transition = null;
	outro?: Transition = null;
	animation?: Animation = null;
	children: INode[];
	scope: TemplateScope;

	constructor(component: Component, parent, scope, info) {
		super(component, parent, scope, info);

		this.name = info.name;

		if (typeof info.tag === 'string') {
			this.tag = new Expression(component, this, scope, string_literal(info.tag) as Literal);
		} else {
			this.tag = new Expression(component, this, scope, info.tag);
		}

		info.attributes.forEach((node) => {
			switch (node.type) {
				case 'Action':
					this.actions.push(new Action(component, this, scope, node));
					break;

				case 'Attribute':
				case 'Spread':
					this.attributes.push(new Attribute(component, this, scope, node));
					break;

				case 'Binding':
					this.bindings.push(new Binding(component, this, scope, node));
					break;

				case 'Class':
					this.classes.push(new Class(component, this, scope, node));
					break;

				case 'EventHandler':
					this.handlers.push(new EventHandler(component, this, scope, node));
					break;

				case 'Let': {
					const l = new Let(component, this, scope, node);
					this.lets.push(l);
					const dependencies = new Set([l.name.name]);

					l.names.forEach((name) => {
						scope.add(name, dependencies, this);
					});
					break;
				}

				case 'Transition': {
					const transition = new Transition(component, this, scope, node);
					if (node.intro) this.intro = transition;
					if (node.outro) this.outro = transition;
					break;
				}

				case 'Animation':
					this.animation = new Animation(component, this, scope, node);
					break;

				default:
					throw new Error(`Not implemented: ${node.type}`);
			}
		});

		this.scope = scope;

		this.children = map_children(component, this, this.scope, info.children);
	}
}
