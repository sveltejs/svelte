import deindent from '../../utils/deindent';
import { stringify } from '../../utils/stringify';
import flattenReference from '../../utils/flattenReference';
import isVoidElementName from '../../utils/isVoidElementName';
import validCalleeObjects from '../../utils/validCalleeObjects';
import reservedNames from '../../utils/reservedNames';
import Node from './shared/Node';
import Block from '../dom/Block';
import State from '../dom/State';
import Attribute from './Attribute';
import Text from './Text';
import * as namespaces from '../../utils/namespaces';

// temp - move this logic in here
import addBindings from '../dom/visitors/Element/addBindings';
import addTransitions from '../dom/visitors/Element/addTransitions';
import visitAttribute from '../dom/visitors/Element/Attribute';

export default class Element extends Node {
	type: 'Element';
	name: string;
	attributes: Attribute[]; // TODO have more specific Attribute type
	children: Node[];

	init(
		block: Block,
		state: State,
		inEachBlock: boolean,
		elementStack: Node[],
		componentStack: Node[],
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		if (this.name === 'slot' || this.name === 'option') {
			this.cannotUseInnerHTML();
		}

		this.attributes.forEach(attribute => {
			if (attribute.type === 'Attribute' && attribute.value !== true) {
				attribute.value.forEach((chunk: Node) => {
					if (chunk.type !== 'Text') {
						if (this.parent) this.parent.cannotUseInnerHTML();

						const dependencies = chunk.metadata.dependencies;
						block.addDependencies(dependencies);

						// special case — <option value='{{foo}}'> — see below
						if (
							this.name === 'option' &&
							attribute.name === 'value' &&
							state.selectBindingDependencies
						) {
							state.selectBindingDependencies.forEach(prop => {
								dependencies.forEach((dependency: string) => {
									this.generator.indirectDependencies.get(prop).add(dependency);
								});
							});
						}
					}
				});
			} else {
				if (this.parent) this.parent.cannotUseInnerHTML();

				if (attribute.type === 'EventHandler' && attribute.expression) {
					attribute.expression.arguments.forEach((arg: Node) => {
						block.addDependencies(arg.metadata.dependencies);
					});
				} else if (attribute.type === 'Binding') {
					block.addDependencies(attribute.metadata.dependencies);
				} else if (attribute.type === 'Transition') {
					if (attribute.intro)
						this.generator.hasIntroTransitions = block.hasIntroMethod = true;
					if (attribute.outro) {
						this.generator.hasOutroTransitions = block.hasOutroMethod = true;
						block.outros += 1;
					}
				}
			}
		});

		const valueAttribute = this.attributes.find((attribute: Node) => attribute.name === 'value');

		// Treat these the same way:
		//   <option>{{foo}}</option>
		//   <option value='{{foo}}'>{{foo}}</option>
		if (this.name === 'option' && !valueAttribute) {
			this.attributes.push(new Attribute({
				type: 'Attribute',
				name: 'value',
				value: this.children
			}));
		}

		// special case — in a case like this...
		//
		//   <select bind:value='foo'>
		//     <option value='{{bar}}'>bar</option>
		//     <option value='{{baz}}'>baz</option>
		//   </option>
		//
		// ...we need to know that `foo` depends on `bar` and `baz`,
		// so that if `foo.qux` changes, we know that we need to
		// mark `bar` and `baz` as dirty too
		if (this.name === 'select') {
			const binding = this.attributes.find(node => node.type === 'Binding' && node.name === 'value');
			if (binding) {
				// TODO does this also apply to e.g. `<input type='checkbox' bind:group='foo'>`?
				const dependencies = binding.metadata.dependencies;
				state.selectBindingDependencies = dependencies;
				dependencies.forEach((prop: string) => {
					this.generator.indirectDependencies.set(prop, new Set());
				});
			} else {
				state.selectBindingDependencies = null;
			}
		}

		const slot = this.getStaticAttributeValue('slot');
		if (slot && this.isChildOfComponent()) {
			this.cannotUseInnerHTML();
			this.slotted = true;
			// TODO validate slots — no nesting, no dynamic names...
			const component = componentStack[componentStack.length - 1];
			component._slots.add(slot);
		}

		this.var = block.getUniqueName(
			this.name.replace(/[^a-zA-Z0-9_$]/g, '_')
		);

		this._state = state.child({
			parentNode: this.var,
			parentNodes: block.getUniqueName(`${this.var}_nodes`),
			parentNodeName: this.name,
			namespace: this.name === 'svg'
				? 'http://www.w3.org/2000/svg'
				: state.namespace,
			allUsedContexts: [],
		});

		this.generator.stylesheet.apply(this, elementStack);

		if (this.children.length) {
			if (this.name === 'pre' || this.name === 'textarea') stripWhitespace = false;
			this.initChildren(block, this._state, inEachBlock, elementStack.concat(this), componentStack, stripWhitespace, nextSibling);
		}
	}

	build(
		block: Block,
		state: State,
		elementStack: Node[],
		componentStack: Node[]
	) {
		const { generator } = this;

		if (this.name === 'slot') {
			const slotName = this.getStaticAttributeValue('name') || 'default';
			this.generator.slots.add(slotName);
		}

		const childState = this._state;
		const name = childState.parentNode;

		const slot = this.attributes.find((attribute: Node) => attribute.name === 'slot');
		const parentNode = this.slotted ?
			`${componentStack[componentStack.length - 1].var}._slotted.${slot.value[0].data}` : // TODO this looks bonkers
			state.parentNode;

		block.addVariable(name);
		block.builders.create.addLine(
			`${name} = ${getRenderStatement(
				this.generator,
				childState.namespace,
				this.name
			)};`
		);

		if (this.generator.hydratable) {
			block.builders.claim.addBlock(deindent`
				${name} = ${getClaimStatement(generator, childState.namespace, state.parentNodes, this)};
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
		if (this._needsCssAttribute && !this.generator.customElement) {
			this.generator.needsEncapsulateHelper = true;
			block.builders.hydrate.addLine(
				`@encapsulateStyles(${name});`
			);

			if (this._cssRefAttribute) {
				block.builders.hydrate.addLine(
					`@setAttribute(${name}, "svelte-ref-${this._cssRefAttribute}", "");`
				)
			}
		}

		if (this.name === 'textarea') {
			// this is an egregious hack, but it's the easiest way to get <textarea>
			// children treated the same way as a value attribute
			if (this.children.length > 0) {
				this.attributes.push({
					type: 'Attribute',
					name: 'value',
					value: this.children,
				});

				this.children = [];
			}
		}

		// insert static children with textContent or innerHTML
		if (!childState.namespace && this.canUseInnerHTML && this.children.length > 0) {
			if (this.children.length === 1 && this.children[0].type === 'Text') {
				block.builders.create.addLine(
					`${name}.textContent = ${stringify(this.children[0].data)};`
				);
			} else {
				block.builders.create.addLine(
					`${name}.innerHTML = ${stringify(this.children.map(toHTML).join(''))};`
				);
			}
		} else {
			this.children.forEach((child: Node) => {
				child.build(block, childState, elementStack.concat(this), componentStack);
			});
		}

		addBindings(this.generator, block, childState, this);

		this.attributes.filter((a: Node) => a.type === 'Attribute').forEach((attribute: Node) => {
			visitAttribute(this.generator, block, childState, this, attribute);
		});

		// event handlers
		this.attributes.filter((a: Node) => a.type === 'EventHandler').forEach((attribute: Node) => {
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
		this.attributes.filter((a: Node) => a.type === 'Ref').forEach((attribute: Node) => {
			const ref = `#component.refs.${attribute.name}`;

			block.builders.mount.addLine(
				`${ref} = ${name};`
			);

			block.builders.destroy.addLine(
				`if (${ref} === ${name}) ${ref} = null;`
			);

			generator.usesRefs = true; // so component.refs object is created
		});

		addTransitions(generator, block, childState, this);

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

		if (this.initialUpdate) {
			block.builders.mount.addBlock(this.initialUpdate);
		}

		block.builders.claim.addLine(
			`${childState.parentNodes}.forEach(@detachNode);`
		);

		function toHTML(node: Element | Text) {
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

	getStaticAttributeValue(name: string) {
		const attribute = this.attributes.find(
			(attr: Node) => attr.name.toLowerCase() === name
		);

		if (!attribute) return null;

		if (attribute.value === true) return true;
		if (attribute.value.length === 0) return '';

		if (attribute.value.length === 1 && attribute.value[0].type === 'Text') {
			return attribute.value[0].data;
		}

		return null;
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