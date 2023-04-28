import Node from './shared/Node';
import Binding from './Binding';
import EventHandler from './EventHandler';
import fuzzymatch from '../../utils/fuzzymatch';
import Action from './Action';
import Component from '../Component';
import list from '../../utils/list';
import TemplateScope from './shared/TemplateScope';
import { Element } from '../../interfaces';
import compiler_warnings from '../compiler_warnings';
import compiler_errors from '../compiler_errors';

const valid_bindings = [
	'fullscreenElement',
	'visibilityState'
];

export default class Document extends Node {
	type: 'Document';
	handlers: EventHandler[] = [];
	bindings: Binding[] = [];
	actions: Action[] = [];

	constructor(component: Component, parent: Node, scope: TemplateScope, info: Element) {
		super(component, parent, scope, info);

		info.attributes.forEach((node) => {
			if (node.type === 'EventHandler') {
				this.handlers.push(new EventHandler(component, this, scope, node));
			} else if (node.type === 'Binding') {
				if (!~valid_bindings.indexOf(node.name)) {
					const match = fuzzymatch(node.name, valid_bindings);
					if (match) {
						return component.error(node, compiler_errors.invalid_binding_on(node.name, '<svelte:document>', ` (did you mean '${match}'?)`));
					} else {
						return component.error(node, compiler_errors.invalid_binding_on(node.name, '<svelte:document>', ` — valid bindings are ${list(valid_bindings)}`));
					}
				}

				this.bindings.push(new Binding(component, this, scope, node));
			} else if (node.type === 'Action') {
				this.actions.push(new Action(component, this, scope, node));
			} else {
				// TODO there shouldn't be anything else here...
			}
		});

		this.validate();
	}

	private validate() {
		const handlers_map = new Set();

		this.handlers.forEach(handler => (
			handlers_map.add(handler.name)
		));

		if (handlers_map.has('mouseenter') || handlers_map.has('mouseleave')) {
			this.component.warn(this, compiler_warnings.avoid_mouse_events_on_document);
		}
	}
}
