import Wrapper from './shared/Wrapper.js';
import { x } from 'code-red';
import EventHandler from './Element/EventHandler.js';
import add_event_handlers from './shared/add_event_handlers.js';
import add_actions from './shared/add_actions.js';

/** @extends Wrapper<import('../../nodes/Body.js').default> */
export default class BodyWrapper extends Wrapper {
	/** @type {import('./Element/EventHandler.js').default[]} */
	handlers;

	/**
	 * @param {import('../Renderer.js').default} renderer
	 * @param {import('../Block.js').default} block
	 * @param {import('./shared/Wrapper.js').default} parent
	 * @param {import('../../nodes/Body.js').default} node
	 */
	constructor(renderer, block, parent, node) {
		super(renderer, block, parent, node);
		this.handlers = this.node.handlers.map((handler) => new EventHandler(handler, this));
	}

	/**
	 * @param {import('../Block.js').default} block
	 * @param {import('estree').Identifier} _parent_node
	 * @param {import('estree').Identifier} _parent_nodes
	 */
	render(block, _parent_node, _parent_nodes) {
		add_event_handlers(block, x`@_document.body`, this.handlers);
		add_actions(block, x`@_document.body`, this.node.actions);
	}
}
