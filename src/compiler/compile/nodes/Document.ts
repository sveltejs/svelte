import Node from './shared/Node';
import EventHandler from './EventHandler';
import Action from './Action';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { Element } from '../../interfaces';
import compiler_warnings from '../compiler_warnings';

export default class Document extends Node {
	type: 'Document';
	handlers: EventHandler[] = [];
	actions: Action[] = [];

	constructor(component: Component, parent: Node, scope: TemplateScope, info: Element) {
		super(component, parent, scope, info);

		info.attributes.forEach((node) => {
			if (node.type === 'EventHandler') {
				this.handlers.push(new EventHandler(component, this, scope, node));
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
