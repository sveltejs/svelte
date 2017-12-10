import deindent from '../../utils/deindent';
import { stringify } from '../../utils/stringify';
import flattenReference from '../../utils/flattenReference';
import isVoidElementName from '../../utils/isVoidElementName';
import validCalleeObjects from '../../utils/validCalleeObjects';
import reservedNames from '../../utils/reservedNames';
import Node from './shared/Node';
import Block from '../dom/Block';
import Attribute from './Attribute';

const associatedEvents = {
	innerWidth: 'resize',
	innerHeight: 'resize',
	outerWidth: 'resize',
	outerHeight: 'resize',

	scrollX: 'scroll',
	scrollY: 'scroll',
};

const readonly = new Set([
	'innerWidth',
	'innerHeight',
	'outerWidth',
	'outerHeight',
	'online',
]);

export default class Window extends Node {
	type: 'Window';
	attributes: Attribute[];

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { generator } = this;

		const events = {};
		const bindings: Record<string, string> = {};

		this.attributes.forEach((attribute: Node) => {
			if (attribute.type === 'EventHandler') {
				// TODO verify that it's a valid callee (i.e. built-in or declared method)
				generator.addSourcemapLocations(attribute.expression);

				let usesState = false;

				attribute.expression.arguments.forEach((arg: Node) => {
					block.contextualise(arg, null, true);
					const { dependencies } = arg.metadata;
					if (dependencies.length) usesState = true;
				});

				const flattened = flattenReference(attribute.expression.callee);
				if (flattened.name !== 'event' && flattened.name !== 'this') {
					// allow event.stopPropagation(), this.select() etc
					generator.code.prependRight(
						attribute.expression.start,
						`${block.alias('component')}.`
					);
				}

				const handlerName = block.getUniqueName(`onwindow${attribute.name}`);
				const handlerBody = deindent`
					${usesState && `var state = #component.get();`}
					[✂${attribute.expression.start}-${attribute.expression.end}✂];
				`;

				block.builders.init.addBlock(deindent`
					function ${handlerName}(event) {
						${handlerBody}
					}
					window.addEventListener("${attribute.name}", ${handlerName});
				`);

				block.builders.destroy.addBlock(deindent`
					window.removeEventListener("${attribute.name}", ${handlerName});
				`);
			}

			if (attribute.type === 'Binding') {
				// in dev mode, throw if read-only values are written to
				if (readonly.has(attribute.name)) {
					generator.readonly.add(attribute.value.name);
				}

				bindings[attribute.name] = attribute.value.name;

				// bind:online is a special case, we need to listen for two separate events
				if (attribute.name === 'online') return;

				const associatedEvent = associatedEvents[attribute.name];

				if (!events[associatedEvent]) events[associatedEvent] = [];
				events[associatedEvent].push(
					`${attribute.value.name}: this.${attribute.name}`
				);

				// add initial value
				generator.metaBindings.push(
					`this._state.${attribute.value.name} = window.${attribute.name};`
				);
			}
		});

		const lock = block.getUniqueName(`window_updating`);

		Object.keys(events).forEach(event => {
			const handlerName = block.getUniqueName(`onwindow${event}`);
			const props = events[event].join(',\n');

			if (event === 'scroll') {
				// TODO other bidirectional bindings...
				block.addVariable(lock, 'false');
			}

			const handlerBody = deindent`
				${event === 'scroll' && `${lock} = true;`}
				${generator.options.dev && `component._updatingReadonlyProperty = true;`}

				#component.set({
					${props}
				});

				${generator.options.dev && `component._updatingReadonlyProperty = false;`}
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
		if (bindings.scrollX && bindings.scrollY) {
			const observerCallback = block.getUniqueName(`scrollobserver`);

			block.builders.init.addBlock(deindent`
				function ${observerCallback}() {
					if (${lock}) return;
					var x = ${bindings.scrollX
						? `#component.get("${bindings.scrollX}")`
						: `window.scrollX`};
					var y = ${bindings.scrollY
						? `#component.get("${bindings.scrollY}")`
						: `window.scrollY`};
					window.scrollTo(x, y);
				}
			`);

			if (bindings.scrollX)
				block.builders.init.addLine(
					`#component.observe("${bindings.scrollX}", ${observerCallback});`
				);
			if (bindings.scrollY)
				block.builders.init.addLine(
					`#component.observe("${bindings.scrollY}", ${observerCallback});`
				);
		} else if (bindings.scrollX || bindings.scrollY) {
			const isX = !!bindings.scrollX;

			block.builders.init.addBlock(deindent`
				#component.observe("${bindings.scrollX || bindings.scrollY}", function(${isX ? 'x' : 'y'}) {
					if (${lock}) return;
					window.scrollTo(${isX ? 'x, window.scrollY' : 'window.scrollX, y'});
				});
			`);
		}

		// another special case. (I'm starting to think these are all special cases.)
		if (bindings.online) {
			const handlerName = block.getUniqueName(`onlinestatuschanged`);
			block.builders.init.addBlock(deindent`
				function ${handlerName}(event) {
					#component.set({ ${bindings.online}: navigator.onLine });
				}
				window.addEventListener("online", ${handlerName});
				window.addEventListener("offline", ${handlerName});
			`);

			// add initial value
			generator.metaBindings.push(
				`this._state.${bindings.online} = navigator.onLine;`
			);

			block.builders.destroy.addBlock(deindent`
				window.removeEventListener("online", ${handlerName});
				window.removeEventListener("offline", ${handlerName});
			`);
		}
	}
}
