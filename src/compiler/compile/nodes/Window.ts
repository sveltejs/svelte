import Node from './shared/Node';
import Binding from './Binding';
import EventHandler from './EventHandler';
import flatten_reference from '../utils/flatten_reference';
import fuzzymatch from '../../utils/fuzzymatch';
import list from '../../utils/list';
import Action from './Action';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import compiler_errors from '../compiler_errors';

const valid_bindings = [
	'innerWidth',
	'innerHeight',
	'outerWidth',
	'outerHeight',
	'scrollX',
	'scrollY',
	'online'
];

export default class Window extends Node {
	type: 'Window';
	handlers: EventHandler[] = [];
	bindings: Binding[] = [];
	actions: Action[] = [];

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		info.attributes.forEach(node => {
			if (node.type === 'EventHandler') {
				this.handlers.push(new EventHandler(component, this, scope, node));
			} else if (node.type === 'Binding') {
				if (node.expression.type !== 'Identifier') {
					const { parts } = flatten_reference(node.expression);

					// TODO is this constraint necessary?
					return component.error(node.expression, compiler_errors.invalid_binding_window(parts));
				}

				if (!~valid_bindings.indexOf(node.name)) {
					const match = (
						node.name === 'width' ? 'innerWidth' :
							node.name === 'height' ? 'innerHeight' :
								fuzzymatch(node.name, valid_bindings)
					);

					if (match) {
						return component.error(node, compiler_errors.invalid_binding_on(node.name, '<svelte:window>', ` (did you mean '${match}'?)`));
					} else {
						return component.error(node, compiler_errors.invalid_binding_on(node.name, '<svelte:window>', ` — valid bindings are ${list(valid_bindings)}`));
					}
				}

				this.bindings.push(new Binding(component, this, scope, node));
			} else if (node.type === 'Action') {
				this.actions.push(new Action(component, this, scope, node));
			} else {
				// TODO there shouldn't be anything else here...
			}
		});
	}
}
