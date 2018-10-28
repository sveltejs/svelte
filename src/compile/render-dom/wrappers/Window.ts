import Renderer from '../Renderer';
import Block from '../Block';
import Node from '../../nodes/shared/Node';
import Wrapper from './shared/Wrapper';
import deindent from '../../../utils/deindent';

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
	constructor(renderer: Renderer, block: Block, parent: Wrapper, node: Node) {
		super(renderer, block, parent, node);
	}

	render(block: Block, parentNode: string, parentNodes: string) {
		const { renderer } = this;
		const { component } = renderer;

		const events = {};
		const bindings: Record<string, string> = {};

		this.node.handlers.forEach(handler => {
			// TODO verify that it's a valid callee (i.e. built-in or declared method)
			component.addSourcemapLocations(handler.expression);

			const isCustomEvent = component.events.has(handler.name);

			let usesState = handler.dependencies.size > 0;

			handler.render(component, block, 'window', false); // TODO hoist?

			const handlerName = block.getUniqueName(`onwindow${handler.name}`);
			const handlerBody = deindent`
				${usesState && `var ctx = #component.get();`}
				${handler.snippet};
			`;

			if (isCustomEvent) {
				// TODO dry this out
				block.addVariable(handlerName);

				block.builders.hydrate.addBlock(deindent`
					${handlerName} = %events-${handler.name}.call(#component, window, function(event) {
						${handlerBody}
					});
				`);

				block.builders.destroy.addLine(deindent`
					${handlerName}.destroy();
				`);
			} else {
				block.builders.init.addBlock(deindent`
					function ${handlerName}(event) {
						${handlerBody}
					}
					window.addEventListener("${handler.name}", ${handlerName});
				`);

				block.builders.destroy.addBlock(deindent`
					window.removeEventListener("${handler.name}", ${handlerName});
				`);
			}
		});

		this.node.bindings.forEach(binding => {
			// in dev mode, throw if read-only values are written to
			if (readonly.has(binding.name)) {
				renderer.readonly.add(binding.value.node.name);
			}

			bindings[binding.name] = binding.value.node.name;

			// bind:online is a special case, we need to listen for two separate events
			if (binding.name === 'online') return;

			const associatedEvent = associatedEvents[binding.name];
			const property = properties[binding.name] || binding.name;

			if (!events[associatedEvent]) events[associatedEvent] = [];
			events[associatedEvent].push({
				name: binding.value.node.name,
				value: property
			});
		});

		const lock = block.getUniqueName(`window_updating`);
		const clear = block.getUniqueName(`clear_window_updating`);
		const timeout = block.getUniqueName(`window_updating_timeout`);

		Object.keys(events).forEach(event => {
			const handlerName = block.getUniqueName(`onwindow${event}`);
			const props = events[event];

			if (event === 'scroll') {
				// TODO other bidirectional bindings...
				block.addVariable(lock, 'false');
				block.addVariable(clear, `function() { ${lock} = false; }`);
				block.addVariable(timeout);

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
			} else {
				props.forEach(prop => {
					renderer.metaBindings.addLine(
						`this._state.${prop.name} = window.${prop.value};`
					);
				});
			}

			const handlerBody = deindent`
				${event === 'scroll' && deindent`
					if (${lock}) return;
					${lock} = true;
				`}
				${component.options.dev && `component._updatingReadonlyProperty = true;`}

				#component.set({
					${props.map(prop => `${prop.name}: this.${prop.value}`)}
				});

				${component.options.dev && `component._updatingReadonlyProperty = false;`}
				${event === 'scroll' && `${lock} = false;`}
			`;

			block.builders.init.addBlock(deindent`
				function ${handlerName}(event) {
					${handlerBody}
				}
				window.addEventListener("${event}", ${handlerName});
			`);

			block.builders.destroy.addBlock(deindent`
				window.removeEventListener("${event}", ${handlerName});
			`);
		});

		// special case... might need to abstract this out if we add more special cases
		if (bindings.scrollX || bindings.scrollY) {
			block.builders.init.addBlock(deindent`
				#component.on("state", ({ changed, current }) => {
					if (${
						[bindings.scrollX, bindings.scrollY].map(
							binding => binding && `changed["${binding}"]`
						).filter(Boolean).join(' || ')
					} && !${lock}) {
						${lock} = true;
						clearTimeout(${timeout});
						window.scrollTo(${
							bindings.scrollX ? `current["${bindings.scrollX}"]` : `window.pageXOffset`
						}, ${
							bindings.scrollY ? `current["${bindings.scrollY}"]` : `window.pageYOffset`
						});
						${timeout} = setTimeout(${clear}, 100);
					}
				});
			`);
		}

		// another special case. (I'm starting to think these are all special cases.)
		if (bindings.online) {
			const handlerName = block.getUniqueName(`onlinestatuschanged`);
			block.builders.init.addBlock(deindent`
				function ${handlerName}(event) {
					${component.options.dev && `component._updatingReadonlyProperty = true;`}
					#component.set({ ${bindings.online}: navigator.onLine });
					${component.options.dev && `component._updatingReadonlyProperty = false;`}
				}
				window.addEventListener("online", ${handlerName});
				window.addEventListener("offline", ${handlerName});
			`);

			// add initial value
			renderer.metaBindings.addLine(
				`this._state.${bindings.online} = navigator.onLine;`
			);

			block.builders.destroy.addBlock(deindent`
				window.removeEventListener("online", ${handlerName});
				window.removeEventListener("offline", ${handlerName});
			`);
		}
	}
}