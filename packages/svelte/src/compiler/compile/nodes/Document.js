import Node from './shared/Node.js';
import Binding from './Binding.js';
import EventHandler from './EventHandler.js';
import fuzzymatch from '../../utils/fuzzymatch.js';
import Action from './Action.js';
import list from '../../utils/list.js';
import compiler_warnings from '../compiler_warnings.js';
import compiler_errors from '../compiler_errors.js';

const valid_bindings = ['fullscreenElement', 'visibilityState'];

/** @extends Node<'Document'> */
export default class Document extends Node {
	/** @type {import('./EventHandler.js').default[]} */
	handlers = [];

	/** @type {import('./Binding.js').default[]} */
	bindings = [];

	/** @type {import('./Action.js').default[]} */
	actions = [];

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./shared/Node.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').Element} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		info.attributes.forEach((node) => {
			if (node.type === 'EventHandler') {
				this.handlers.push(new EventHandler(component, this, scope, node));
			} else if (node.type === 'Binding') {
				if (!~valid_bindings.indexOf(node.name)) {
					const match = fuzzymatch(node.name, valid_bindings);
					if (match) {
						return component.error(
							node,
							compiler_errors.invalid_binding_on(
								node.name,
								'<svelte:document>',
								` (did you mean '${match}'?)`
							)
						);
					} else {
						return component.error(
							node,
							compiler_errors.invalid_binding_on(
								node.name,
								'<svelte:document>',
								` — valid bindings are ${list(valid_bindings)}`
							)
						);
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

	/** @private */
	validate() {
		const handlers_map = new Set();
		this.handlers.forEach((handler) => handlers_map.add(handler.name));
		if (handlers_map.has('mouseenter') || handlers_map.has('mouseleave')) {
			this.component.warn(this, compiler_warnings.avoid_mouse_events_on_document);
		}
	}
}
