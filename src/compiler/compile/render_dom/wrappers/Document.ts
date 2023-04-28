import Block from '../Block';
import Wrapper from './shared/Wrapper';
import { b, x } from 'code-red';
import Document from '../../nodes/Document';
import { Identifier } from 'estree';
import EventHandler from './Element/EventHandler';
import add_event_handlers from './shared/add_event_handlers';
import { TemplateNode } from '../../../interfaces';
import Renderer from '../Renderer';
import add_actions from './shared/add_actions';

const associated_events = {
	fullscreenElement: ['fullscreenchange'],
	visibilityState: ['visibilitychange']
};

const readonly = new Set([
	'fullscreenElement',
	'visibilityState'
]);

export default class DocumentWrapper extends Wrapper {
	node: Document;
	handlers: EventHandler[];

	constructor(renderer: Renderer, block: Block, parent: Wrapper, node: TemplateNode) {
		super(renderer, block, parent, node);
		this.handlers = this.node.handlers.map(handler => new EventHandler(handler, this));
	}

	render(block: Block, _parent_node: Identifier, _parent_nodes: Identifier) {
		const { renderer } = this;
		const { component } = renderer;

		const events: Record<string, Array<{ name: string; value: string }>> = {};
		const bindings: Record<string, string> = {};

		add_event_handlers(block, x`@_document`, this.handlers);
		add_actions(block, x`@_document`, this.node.actions);

		this.node.bindings.forEach(binding => {
			// TODO: what if it's a MemberExpression?
			const binding_name = (binding.expression.node as Identifier).name;

			// in dev mode, throw if read-only values are written to
			if (readonly.has(binding.name)) {
				renderer.readonly.add(binding_name);
			}

			bindings[binding.name] = binding_name;

			const binding_events = associated_events[binding.name];
			const property = binding.name;

			binding_events.forEach(associated_event => {
				if (!events[associated_event]) events[associated_event] = [];
				events[associated_event].push({
					name: binding_name,
					value: property
				});
			});
		});

		Object.keys(events).forEach(event => {
			const id = block.get_unique_name(`ondocument${event}`);
			const props = events[event];

			renderer.add_to_context(id.name);
			const fn = renderer.reference(id.name);

			props.forEach(prop => {
				renderer.meta_bindings.push(
					b`this._state.${prop.name} = @_document.${prop.value};`
				);
			});

			block.event_listeners.push(x`
				@listen(@_document, "${event}", ${fn})
			`);

			component.partly_hoisted.push(b`
				function ${id}() {
					${props.map(prop => renderer.invalidate(prop.name, x`${prop.name} = @_document.${prop.value}`))}
				}
			`);

			block.chunks.init.push(b`
				@add_render_callback(${fn});
			`);

			component.has_reactive_assignments = true;
		});
	}
}
