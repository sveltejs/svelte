import Wrapper from './shared/Wrapper.js';
import { b, x } from 'code-red';
import add_event_handlers from './shared/add_event_handlers.js';
import add_actions from './shared/add_actions.js';
import EventHandler from './Element/EventHandler.js';

const associated_events = {
	innerWidth: 'resize',
	innerHeight: 'resize',
	outerWidth: 'resize',
	outerHeight: 'resize',
	devicePixelRatio: 'resize',
	scrollX: 'scroll',
	scrollY: 'scroll'
};
const properties = {
	scrollX: 'pageXOffset',
	scrollY: 'pageYOffset'
};
const readonly = new Set([
	'innerWidth',
	'innerHeight',
	'outerWidth',
	'outerHeight',
	'devicePixelRatio',
	'online'
]);

/** @extends Wrapper<import('../../nodes/Window.js').default> */
export default class WindowWrapper extends Wrapper {
	/** @type {import('./Element/EventHandler.js').default[]} */
	handlers;

	/**
	 * @param {import('../Renderer.js').default} renderer
	 * @param {import('../Block.js').default} block
	 * @param {import('./shared/Wrapper.js').default} parent
	 * @param {import('../../nodes/Window.js').default} node
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
		add_actions(block, '@_window', this.node.actions);
		add_event_handlers(block, '@_window', this.handlers);
		this.node.bindings.forEach((binding) => {
			// TODO: what if it's a MemberExpression?
			const binding_name = /** @type {import('estree').Identifier} */ (binding.expression.node)
				.name;
			// in dev mode, throw if read-only values are written to
			if (readonly.has(binding.name)) {
				renderer.readonly.add(binding_name);
			}
			bindings[binding.name] = binding_name;
			// bind:online is a special case, we need to listen for two separate events
			if (binding.name === 'online') return;
			const associated_event = associated_events[binding.name];
			const property = properties[binding.name] || binding.name;
			if (!events[associated_event]) events[associated_event] = [];
			events[associated_event].push({
				name: binding_name,
				value: property
			});
		});
		const scrolling = block.get_unique_name('scrolling');
		const clear_scrolling = block.get_unique_name('clear_scrolling');
		const scrolling_timeout = block.get_unique_name('scrolling_timeout');
		Object.keys(events).forEach((event) => {
			const id = block.get_unique_name(`onwindow${event}`);
			const props = events[event];
			renderer.add_to_context(id.name);
			const fn = renderer.reference(id.name);
			if (event === 'scroll') {
				// TODO other bidirectional bindings...
				block.add_variable(scrolling, x`false`);
				block.add_variable(clear_scrolling, x`() => { ${scrolling} = false }`);
				block.add_variable(scrolling_timeout);
				const condition =
					bindings.scrollX && bindings.scrollY
						? x`"${bindings.scrollX}" in this._state || "${bindings.scrollY}" in this._state`
						: x`"${bindings.scrollX || bindings.scrollY}" in this._state`;
				const scroll_x = bindings.scrollX && x`this._state.${bindings.scrollX}`;
				const scroll_y = bindings.scrollY && x`this._state.${bindings.scrollY}`;
				renderer.meta_bindings.push(b`
					if (${condition}) {
						@_scrollTo(${scroll_x || '@_window.pageXOffset'}, ${scroll_y || '@_window.pageYOffset'});
					}
					${scroll_x && `${scroll_x} = @_window.pageXOffset;`}
					${scroll_y && `${scroll_y} = @_window.pageYOffset;`}
				`);
				block.event_listeners.push(x`
					@listen(@_window, "${event}", () => {
						${scrolling} = true;
						@_clearTimeout(${scrolling_timeout});
						${scrolling_timeout} = @_setTimeout(${clear_scrolling}, 100);
						${fn}();
					})
				`);
			} else {
				props.forEach((prop) => {
					renderer.meta_bindings.push(b`this._state.${prop.name} = @_window.${prop.value};`);
				});
				block.event_listeners.push(x`
					@listen(@_window, "${event}", ${fn})
				`);
			}
			component.partly_hoisted.push(b`
				function ${id}() {
					${props.map((prop) => renderer.invalidate(prop.name, x`${prop.name} = @_window.${prop.value}`))}
				}
			`);
			block.chunks.init.push(b`
				@add_render_callback(${fn});
			`);
			component.has_reactive_assignments = true;
		});
		// special case... might need to abstract this out if we add more special cases
		if (bindings.scrollX || bindings.scrollY) {
			const condition = renderer.dirty([bindings.scrollX, bindings.scrollY].filter(Boolean));
			const scroll_x = bindings.scrollX
				? renderer.reference(bindings.scrollX)
				: x`@_window.pageXOffset`;
			const scroll_y = bindings.scrollY
				? renderer.reference(bindings.scrollY)
				: x`@_window.pageYOffset`;
			block.chunks.update.push(b`
				if (${condition} && !${scrolling}) {
					${scrolling} = true;
					@_clearTimeout(${scrolling_timeout});
					@_scrollTo(${scroll_x}, ${scroll_y});
					${scrolling_timeout} = @_setTimeout(${clear_scrolling}, 100);
				}
			`);
		}
		// another special case. (I'm starting to think these are all special cases.)
		if (bindings.online) {
			const id = block.get_unique_name('onlinestatuschanged');
			const name = bindings.online;
			renderer.add_to_context(id.name);
			const reference = renderer.reference(id.name);
			component.partly_hoisted.push(b`
				function ${id}() {
					${renderer.invalidate(name, x`${name} = @_navigator.onLine`)}
				}
			`);
			block.chunks.init.push(b`
				@add_render_callback(${reference});
			`);
			block.event_listeners.push(
				x`@listen(@_window, "online", ${reference})`,
				x`@listen(@_window, "offline", ${reference})`
			);
			component.has_reactive_assignments = true;
		}
	}
}
