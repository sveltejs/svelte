import Renderer from '../Renderer';
import Block from '../Block';
import Node from '../../nodes/shared/Node';
import Wrapper from './shared/Wrapper';
import deindent from '../../../utils/deindent';
import addEventHandlers from './shared/addEventHandlers';
import Window from '../../nodes/Window';
import addActions from './shared/addActions';

const associatedEvents = {
	innerWidth: 'resize',
	innerHeight: 'resize',
	outerWidth: 'resize',
	outerHeight: 'resize',

	scrollX: 'scroll',
	scrollY: 'scroll',
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
	'online',
]);

export default class WindowWrapper extends Wrapper {
	node: Window;

	constructor(renderer: Renderer, block: Block, parent: Wrapper, node: Node) {
		super(renderer, block, parent, node);
	}

	render(block: Block, parentNode: string, parentNodes: string) {
		const { renderer } = this;
		const { component } = renderer;

		const events = {};
		const bindings: Record<string, string> = {};

		addActions(component, block, 'window', this.node.actions);
		addEventHandlers(block, 'window', this.node.handlers);

		this.node.bindings.forEach(binding => {
			// in dev mode, throw if read-only values are written to
			if (readonly.has(binding.name)) {
				renderer.readonly.add(binding.expression.node.name);
			}

			bindings[binding.name] = binding.expression.node.name;

			// bind:online is a special case, we need to listen for two separate events
			if (binding.name === 'online') return;

			const associatedEvent = associatedEvents[binding.name];
			const property = properties[binding.name] || binding.name;

			if (!events[associatedEvent]) events[associatedEvent] = [];
			events[associatedEvent].push({
				name: binding.expression.node.name,
				value: property
			});
		});

		const scrolling = block.getUniqueName(`scrolling`);
		const clear_scrolling = block.getUniqueName(`clear_scrolling`);
		const scrolling_timeout = block.getUniqueName(`scrolling_timeout`);

		Object.keys(events).forEach(event => {
			const handler_name = block.getUniqueName(`onwindow${event}`);
			const props = events[event];

			if (event === 'scroll') {
				// TODO other bidirectional bindings...
				block.addVariable(scrolling, 'false');
				block.addVariable(clear_scrolling, `() => { ${scrolling} = false }`);
				block.addVariable(scrolling_timeout);

				const condition = [
					bindings.scrollX && `"${bindings.scrollX}" in this._state`,
					bindings.scrollY && `"${bindings.scrollY}" in this._state`
				].filter(Boolean).join(' || ');

 				const x = bindings.scrollX && `this._state.${bindings.scrollX}`;
				const y = bindings.scrollY && `this._state.${bindings.scrollY}`;

				renderer.metaBindings.addBlock(deindent`
					if (${condition}) {
						window.scrollTo(${x || 'window.pageXOffset'}, ${y || 'window.pageYOffset'});
					}
					${x && `${x} = window.pageXOffset;`}
					${y && `${y} = window.pageYOffset;`}
				`);

				block.event_listeners.push(deindent`
					@addListener(window, "${event}", () => {
						${scrolling} = true;
						clearTimeout(${scrolling_timeout});
						${scrolling_timeout} = setTimeout(${clear_scrolling}, 100);
						ctx.${handler_name}();
					})
				`);
			} else {
				props.forEach(prop => {
					renderer.metaBindings.addLine(
						`this._state.${prop.name} = window.${prop.value};`
					);
				});

				block.event_listeners.push(deindent`
					@addListener(window, "${event}", ctx.${handler_name})
				`);
			}

			component.declarations.push(handler_name);
			component.template_references.add(handler_name);
			component.partly_hoisted.push(deindent`
				function ${handler_name}() {
					${props.map(prop => `${prop.name} = window.${prop.value}; $$invalidate('${prop.name}', ${prop.name});`)}
				}
			`);



			block.builders.init.addBlock(deindent`
				@add_render_callback(ctx.${handler_name});
			`);

			component.has_reactive_assignments = true;
		});

		// special case... might need to abstract this out if we add more special cases
		if (bindings.scrollX || bindings.scrollY) {
			block.builders.update.addBlock(deindent`
				if (${
					[bindings.scrollX, bindings.scrollY].filter(Boolean).map(
						b => `changed.${b}`
					).join(' || ')
				} && !${scrolling}) {
					${scrolling} = true;
					clearTimeout(${scrolling_timeout});
					window.scrollTo(${
						bindings.scrollX ? `current["${bindings.scrollX}"]` : `window.pageXOffset`
					}, ${
						bindings.scrollY ? `current["${bindings.scrollY}"]` : `window.pageYOffset`
					});
					${scrolling_timeout} = setTimeout(${clear_scrolling}, 100);
				}
			`);
		}

		// another special case. (I'm starting to think these are all special cases.)
		if (bindings.online) {
			const handler_name = block.getUniqueName(`onlinestatuschanged`);
			block.builders.init.addBlock(deindent`
				function ${handler_name}(event) {
					${component.options.dev && `component._updatingReadonlyProperty = true;`}
					#component.set({ ${bindings.online}: navigator.onLine });
					${component.options.dev && `component._updatingReadonlyProperty = false;`}
				}
				window.addEventListener("online", ${handler_name});
				window.addEventListener("offline", ${handler_name});
			`);

			// add initial value
			renderer.metaBindings.addLine(
				`this._state.${bindings.online} = navigator.onLine;`
			);

			block.builders.destroy.addBlock(deindent`
				window.removeEventListener("online", ${handler_name});
				window.removeEventListener("offline", ${handler_name});
			`);
		}
	}
}
