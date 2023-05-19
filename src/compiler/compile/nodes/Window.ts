import Node from './shared/Node.js';
import Binding from './Binding.js';
import EventHandler from './EventHandler.js';
import flatten_reference from '../utils/flatten_reference.js';
import fuzzymatch from '../../utils/fuzzymatch.js';
import list from '../../utils/list.js';
import Action from './Action.js';
import compiler_errors from '../compiler_errors.js';

const valid_bindings = [
	'innerWidth',
	'innerHeight',
	'outerWidth',
	'outerHeight',
	'scrollX',
	'scrollY',
	'devicePixelRatio',
	'online'
];

/** @extends Node<'Window'> */
export default class Window extends Node {
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
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		info.attributes.forEach(
			/** @param {any} node */ (node) => {
				if (node.type === 'EventHandler') {
					this.handlers.push(new EventHandler(component, this, scope, node));
				} else if (node.type === 'Binding') {
					if (node.expression.type !== 'Identifier') {
						const { parts } = flatten_reference(node.expression);
						// TODO is this constraint necessary?
						return component.error(node.expression, compiler_errors.invalid_binding_window(parts));
					}
					if (!~valid_bindings.indexOf(node.name)) {
						const match =
							node.name === 'width'
								? 'innerWidth'
								: node.name === 'height'
								? 'innerHeight'
								: fuzzymatch(node.name, valid_bindings);
						if (match) {
							return component.error(
								node,
								compiler_errors.invalid_binding_on(
									node.name,
									'<svelte:window>',
									` (did you mean '${match}'?)`
								)
							);
						} else {
							return component.error(
								node,
								compiler_errors.invalid_binding_on(
									node.name,
									'<svelte:window>',
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
			}
		);
	}
}
