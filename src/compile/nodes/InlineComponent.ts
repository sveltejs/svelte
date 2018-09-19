import deindent from '../../utils/deindent';
import stringifyProps from '../../utils/stringifyProps';
import CodeBuilder from '../../utils/CodeBuilder';
import getTailSnippet from '../../utils/getTailSnippet';
import getObject from '../../utils/getObject';
import { quoteNameIfNecessary, quotePropIfNecessary } from '../../utils/quoteIfNecessary';
import { escape, escapeTemplate, stringify } from '../../utils/stringify';
import Node from './shared/Node';
import Block from '../render-dom/Block';
import Attribute from './Attribute';
import mapChildren from './shared/mapChildren';
import Binding from './Binding';
import EventHandler from './EventHandler';
import Expression from './shared/Expression';
import { AppendTarget } from '../../interfaces';
import addToSet from '../../utils/addToSet';
import Component from '../Component';
import isValidIdentifier from '../../utils/isValidIdentifier';
import Ref from './Ref';

export default class InlineComponent extends Node {
	type: 'InlineComponent';
	name: string;
	expression: Expression;
	attributes: Attribute[];
	bindings: Binding[];
	handlers: EventHandler[];
	children: Node[];
	ref: Ref;

	constructor(component: Component, parent, scope, info) {
		super(component, parent, scope, info);

		component.hasComponents = true;

		this.name = info.name;

		if (this.name !== 'svelte:self' && this.name !== 'svelte:component') {
			if (!component.components.has(this.name)) {
				component.error(this, {
					code: `missing-component`,
					message: `${this.name} component is not defined`
				});
			}

			component.used.components.add(this.name);
		}

		this.expression = this.name === 'svelte:component'
			? new Expression(component, this, scope, info.expression)
			: null;

		this.attributes = [];
		this.bindings = [];
		this.handlers = [];

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

				case 'Ref':
					this.ref = new Ref(component, this, scope, node);
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

		this.children = mapChildren(component, this, scope, info.children);
	}
}
