import Wrapper from './shared/Wrapper.js';
import { b, x } from 'code-red';
import EventHandler from './Element/EventHandler.js';
import add_event_handlers from './shared/add_event_handlers.js';
import add_actions from './shared/add_actions.js';

const associated_events = {
	fullscreenElement: ['fullscreenchange'],
	visibilityState: ['visibilitychange']
};
const readonly = new Set(['fullscreenElement', 'visibilityState']);

/** @extends Wrapper<import('../../nodes/Document.js').default> */
export default class DocumentWrapper extends Wrapper {
	/** @type {import('./Element/EventHandler.js').default[]} */
	handlers;

	/**
	 * @param {import('../Renderer.js').default} renderer
	 * @param {import('../Block.js').default} block
	 * @param {import('./shared/Wrapper.js').default} parent
	 * @param {import('../../nodes/Document.js').default} node
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
		const { renderer } = this;
		const { component } = renderer;

		/** @type {Record<string, Array<{ name: string; value: string }>>} */
		const events = {};

		/** @type {Record<string, string>} */
		const bindings = {};
		add_event_handlers(block, x`@_document`, this.handlers);
		add_actions(block, x`@_document`, this.node.actions);
		this.node.bindings.forEach((binding) => {
			// TODO: what if it's a MemberExpression?
			const binding_name = /** @type {import('estree').Identifier} */ (binding.expression.node)
				.name;
			// in dev mode, throw if read-only values are written to
			if (readonly.has(binding.name)) {
				renderer.readonly.add(binding_name);
			}
			bindings[binding.name] = binding_name;
			const binding_events = associated_events[binding.name];
			const property = binding.name;
			binding_events.forEach((associated_event) => {
				if (!events[associated_event]) events[associated_event] = [];
				events[associated_event].push({
					name: binding_name,
					value: property
				});
			});
		});
		Object.keys(events).forEach((event) => {
			const id = block.get_unique_name(`ondocument${event}`);
			const props = events[event];
			renderer.add_to_context(id.name);
			const fn = renderer.reference(id.name);
			props.forEach((prop) => {
				renderer.meta_bindings.push(b`this._state.${prop.name} = @_document.${prop.value};`);
			});
			block.event_listeners.push(x`
				@listen(@_document, "${event}", ${fn})
			`);
			component.partly_hoisted.push(b`
				function ${id}() {
					${props.map((prop) => renderer.invalidate(prop.name, x`${prop.name} = @_document.${prop.value}`))}
				}
			`);
			block.chunks.init.push(b`
				@add_render_callback(${fn});
			`);
			component.has_reactive_assignments = true;
		});
	}
}
