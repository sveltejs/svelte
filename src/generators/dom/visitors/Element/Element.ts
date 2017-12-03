import deindent from '../../../../utils/deindent';
import visit from '../../visit';
import visitSlot from '../Slot';
import visitComponent from '../Component';
import visitWindow from './meta/Window';
import visitAttribute from './Attribute';
import addBindings from './addBindings';
import flattenReference from '../../../../utils/flattenReference';
import validCalleeObjects from '../../../../utils/validCalleeObjects';
import * as namespaces from '../../../../utils/namespaces';
import getStaticAttributeValue from '../../../../utils/getStaticAttributeValue';
import isVoidElementName from '../../../../utils/isVoidElementName';
import addTransitions from './addTransitions';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';
import reservedNames from '../../../../utils/reservedNames';
import { stringify } from '../../../../utils/stringify';

const meta: Record<string, any> = {
	':Window': visitWindow,
};

export default function visitElement(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	elementStack: Node[],
	componentStack: Node[]
) {
	if (node.name in meta) {
		return meta[node.name](generator, block, node);
	}

	if (node.name === 'slot') {
		if (generator.customElement) {
			const slotName = getStaticAttributeValue(node, 'name') || 'default';
			generator.slots.add(slotName);
		} else {
			return visitSlot(generator, block, state, node, elementStack, componentStack);
		}
	}

	if (generator.components.has(node.name) || node.name === ':Self' || node.name === ':Switch') {
		return visitComponent(generator, block, state, node, elementStack, componentStack);
	}

	const childState = node._state;
	const name = childState.parentNode;

	const slot = node.attributes.find((attribute: Node) => attribute.name === 'slot');
	const parentNode = node.slotted ?
		`${componentStack[componentStack.length - 1].var}._slotted.${slot.value[0].data}` : // TODO this looks bonkers
		state.parentNode;

	block.addVariable(name);
	block.builders.create.addLine(
		`${name} = ${getRenderStatement(
			generator,
			childState.namespace,
			node.name
		)};`
	);

	if (generator.hydratable) {
		block.builders.claim.addBlock(deindent`
			${name} = ${getClaimStatement(generator, childState.namespace, state.parentNodes, node)};
			var ${childState.parentNodes} = @children(${name});
		`);
	}

	if (parentNode) {
		block.builders.mount.addLine(
			`@appendNode(${name}, ${parentNode});`
		);
	} else {
		block.builders.mount.addLine(`@insertNode(${name}, #target, anchor);`);

		// TODO we eventually need to consider what happens to elements
		// that belong to the same outgroup as an outroing element...
		block.builders.unmount.addLine(`@detachNode(${name});`);
	}

	// add CSS encapsulation attribute
	if (node._needsCssAttribute && !generator.customElement) {
		generator.needsEncapsulateHelper = true;
		block.builders.hydrate.addLine(
			`@encapsulateStyles(${name});`
		);

		if (node._cssRefAttribute) {
			block.builders.hydrate.addLine(
				`@setAttribute(${name}, "svelte-ref-${node._cssRefAttribute}", "");`
			)
		}
	}

	if (node.name === 'textarea') {
		// this is an egregious hack, but it's the easiest way to get <textarea>
		// children treated the same way as a value attribute
		if (node.children.length > 0) {
			node.attributes.push({
				type: 'Attribute',
				name: 'value',
				value: node.children,
			});

			node.children = [];
		}
	}

	// insert static children with textContent or innerHTML
	if (!childState.namespace && node.canUseInnerHTML && node.children.length > 0) {
		if (node.children.length === 1 && node.children[0].type === 'Text') {
			block.builders.create.addLine(
				`${name}.textContent = ${stringify(node.children[0].data)};`
			);
		} else {
			block.builders.create.addLine(
				`${name}.innerHTML = ${stringify(node.children.map(toHTML).join(''))};`
			);
		}
	} else {
		node.children.forEach((child: Node) => {
			visit(generator, block, childState, child, elementStack.concat(node), componentStack);
		});
	}

	addBindings(generator, block, childState, node);

	node.attributes.filter((a: Node) => a.type === 'Attribute').forEach((attribute: Node) => {
		visitAttribute(generator, block, childState, node, attribute);
	});

	// event handlers
	node.attributes.filter((a: Node) => a.type === 'EventHandler').forEach((attribute: Node) => {
		const isCustomEvent = generator.events.has(attribute.name);
		const shouldHoist = !isCustomEvent && state.inEachBlock;

		const context = shouldHoist ? null : name;
		const usedContexts: string[] = [];

		if (attribute.expression) {
			generator.addSourcemapLocations(attribute.expression);

			const flattened = flattenReference(attribute.expression.callee);
			if (!validCalleeObjects.has(flattened.name)) {
				// allow event.stopPropagation(), this.select() etc
				// TODO verify that it's a valid callee (i.e. built-in or declared method)
				generator.code.prependRight(
					attribute.expression.start,
					`${block.alias('component')}.`
				);
				if (shouldHoist) childState.usesComponent = true; // this feels a bit hacky but it works!
			}

			attribute.expression.arguments.forEach((arg: Node) => {
				const { contexts } = block.contextualise(arg, context, true);

				contexts.forEach(context => {
					if (!~usedContexts.indexOf(context)) usedContexts.push(context);
					if (!~childState.allUsedContexts.indexOf(context))
						childState.allUsedContexts.push(context);
				});
			});
		}

		const _this = context || 'this';
		const declarations = usedContexts.map(name => {
			if (name === 'state') {
				if (shouldHoist) childState.usesComponent = true;
				return `var state = ${block.alias('component')}.get();`;
			}

			const listName = block.listNames.get(name);
			const indexName = block.indexNames.get(name);
			const contextName = block.contexts.get(name);

			return `var ${listName} = ${_this}._svelte.${listName}, ${indexName} = ${_this}._svelte.${indexName}, ${contextName} = ${listName}[${indexName}];`;
		});

		// get a name for the event handler that is globally unique
		// if hoisted, locally unique otherwise
		const handlerName = (shouldHoist ? generator : block).getUniqueName(
			`${attribute.name.replace(/[^a-zA-Z0-9_$]/g, '_')}_handler`
		);

		// create the handler body
		const handlerBody = deindent`
			${childState.usesComponent &&
				`var ${block.alias('component')} = ${_this}._svelte.component;`}
			${declarations}
			${attribute.expression ?
				`[✂${attribute.expression.start}-${attribute.expression.end}✂];` :
				`${block.alias('component')}.fire("${attribute.name}", event);`}
		`;

		if (isCustomEvent) {
			block.addVariable(handlerName);

			block.builders.hydrate.addBlock(deindent`
				${handlerName} = %events-${attribute.name}.call(#component, ${name}, function(event) {
					${handlerBody}
				});
			`);

			block.builders.destroy.addLine(deindent`
				${handlerName}.teardown();
			`);
		} else {
			const handler = deindent`
				function ${handlerName}(event) {
					${handlerBody}
				}
			`;

			if (shouldHoist) {
				generator.blocks.push(handler);
			} else {
				block.builders.init.addBlock(handler);
			}

			block.builders.hydrate.addLine(
				`@addListener(${name}, "${attribute.name}", ${handlerName});`
			);

			block.builders.destroy.addLine(
				`@removeListener(${name}, "${attribute.name}", ${handlerName});`
			);
		}
	});

	// refs
	node.attributes.filter((a: Node) => a.type === 'Ref').forEach((attribute: Node) => {
		const ref = `#component.refs.${attribute.name}`;

		block.builders.mount.addLine(
			`${ref} = ${name};`
		);

		block.builders.destroy.addLine(
			`if (${ref} === ${name}) ${ref} = null;`
		);

		generator.usesRefs = true; // so component.refs object is created
	});

	addTransitions(generator, block, childState, node);

	if (childState.allUsedContexts.length || childState.usesComponent) {
		const initialProps: string[] = [];
		const updates: string[] = [];

		if (childState.usesComponent) {
			initialProps.push(`component: #component`);
		}

		childState.allUsedContexts.forEach((contextName: string) => {
			if (contextName === 'state') return;

			const listName = block.listNames.get(contextName);
			const indexName = block.indexNames.get(contextName);

			initialProps.push(
				`${listName}: ${listName},\n${indexName}: ${indexName}`
			);
			updates.push(
				`${name}._svelte.${listName} = ${listName};\n${name}._svelte.${indexName} = ${indexName};`
			);
		});

		if (initialProps.length) {
			block.builders.hydrate.addBlock(deindent`
				${name}._svelte = {
					${initialProps.join(',\n')}
				};
			`);
		}

		if (updates.length) {
			block.builders.update.addBlock(updates.join('\n'));
		}
	}

	if (node.initialUpdate) {
		block.builders.mount.addBlock(node.initialUpdate);
	}

	block.builders.claim.addLine(
		`${childState.parentNodes}.forEach(@detachNode);`
	);

	function toHTML(node: Node) {
		if (node.type === 'Text') return node.data;

		let open = `<${node.name}`;

		if (node._needsCssAttribute) {
			open += ` ${generator.stylesheet.id}`;
		}

		if (node._cssRefAttribute) {
			open += ` svelte-ref-${node._cssRefAttribute}`;
		}

		node.attributes.forEach((attr: Node) => {
			open += ` ${attr.name}${stringifyAttributeValue(attr.value)}`
		});

		if (isVoidElementName(node.name)) return open + '>';

		return `${open}>${node.children.map(toHTML).join('')}</${node.name}>`;
	}
}

function getRenderStatement(
	generator: DomGenerator,
	namespace: string,
	name: string
) {
	if (namespace === 'http://www.w3.org/2000/svg') {
		return `@createSvgElement("${name}")`;
	}

	if (namespace) {
		return `document.createElementNS("${namespace}", "${name}")`;
	}

	return `@createElement("${name}")`;
}

function getClaimStatement(
	generator: DomGenerator,
	namespace: string,
	nodes: string,
	node: Node
) {
	const attributes = node.attributes
		.filter((attr: Node) => attr.type === 'Attribute')
		.map((attr: Node) => `${quoteProp(attr.name, generator.legacy)}: true`)
		.join(', ');

	const name = namespace ? node.name : node.name.toUpperCase();

	return `@claimElement(${nodes}, "${name}", ${attributes
		? `{ ${attributes} }`
		: `{}`}, ${namespace === namespaces.svg ? true : false})`;
}

function quoteProp(name: string, legacy: boolean) {
	const isLegacyPropName = legacy && reservedNames.has(name);

	if (/[^a-zA-Z_$0-9]/.test(name) || isLegacyPropName) return `"${name}"`;
	return name;
}

function stringifyAttributeValue(value: Node | true) {
	if (value === true) return '';
	if (value.length === 0) return `=""`;

	const data = value[0].data;
	return `=${JSON.stringify(data)}`;
}