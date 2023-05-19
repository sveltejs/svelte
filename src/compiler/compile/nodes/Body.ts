import Node from './shared/Node.js';
import EventHandler from './EventHandler.js';
import Action from './Action.js';

/** @extends Node<'Body'> */
export default class Body extends Node {
	/** @type {import('./EventHandler.js').default[]} */
	handlers = [];

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
		info.attributes.forEach(
			/** @param {any} node */ (node) => {
				if (node.type === 'EventHandler') {
					this.handlers.push(new EventHandler(component, this, scope, node));
				} else if (node.type === 'Action') {
					this.actions.push(new Action(component, this, scope, node));
				} else {
					// TODO there shouldn't be anything else here...
				}
			}
		);
	}
}
