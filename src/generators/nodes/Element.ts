import deindent from '../../utils/deindent';
import { stringify, escapeHTML } from '../../utils/stringify';
import flattenReference from '../../utils/flattenReference';
import isVoidElementName from '../../utils/isVoidElementName';
import validCalleeObjects from '../../utils/validCalleeObjects';
import reservedNames from '../../utils/reservedNames';
import fixAttributeCasing from '../../utils/fixAttributeCasing';
import Node from './shared/Node';
import Block from '../dom/Block';
import Attribute from './Attribute';
import Binding from './Binding';
import EventHandler from './EventHandler';
import Ref from './Ref';
import Transition from './Transition';
import Action from './Action';
import Text from './Text';
import * as namespaces from '../../utils/namespaces';

export default class Element extends Node {
	type: 'Element';
	name: string;
	attributes: (Attribute | Binding | EventHandler | Ref | Transition | Action)[]; // TODO split these up sooner
	children: Node[];

	init(
		block: Block,
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		if (this.name === 'slot' || this.name === 'option') {
			this.cannotUseInnerHTML();
		}

		const parentElement = this.parent && this.parent.findNearest(/^Element/);
		this.namespace = this.name === 'svg' ?
			namespaces.svg :
			parentElement ? parentElement.namespace : this.generator.namespace;

		this.attributes.forEach(attribute => {
			if (attribute.type === 'Attribute' && attribute.value !== true) {
				// special case — xmlns
				if (attribute.name === 'xmlns') {
					// TODO this attribute must be static – enforce at compile time
					this.namespace = attribute.value[0].data;
				}

				attribute.value.forEach((chunk: Node) => {
					if (chunk.type !== 'Text') {
						if (this.parent) this.parent.cannotUseInnerHTML();

						const dependencies = chunk.metadata.dependencies;
						block.addDependencies(dependencies);

						// special case — <option value='{{foo}}'> — see below
						if (
							this.name === 'option' &&
							attribute.name === 'value'
						) {
							let select = this.parent;
							while (select && (select.type !== 'Element' || select.name !== 'select')) select = select.parent;

							if (select && select.selectBindingDependencies) {
								select.selectBindingDependencies.forEach(prop => {
									dependencies.forEach((dependency: string) => {
										this.generator.indirectDependencies.get(prop).add(dependency);
									});
								});
							}
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
				} else if (attribute.type === 'Action' && attribute.expression) {
					block.addDependencies(attribute.metadata.dependencies);
				}
			}
		});

		const valueAttribute = this.attributes.find((attribute: Attribute) => attribute.name === 'value');

		if (this.name === 'textarea') {
			// this is an egregious hack, but it's the easiest way to get <textarea>
			// children treated the same way as a value attribute
			if (this.children.length > 0) {
				this.attributes.push(new Attribute({
					generator: this.generator,
					name: 'value',
					value: this.children,
					parent: this
				}));

				this.children = [];
			}
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
				this.selectBindingDependencies = dependencies;
				dependencies.forEach((prop: string) => {
					this.generator.indirectDependencies.set(prop, new Set());
				});
			} else {
				this.selectBindingDependencies = null;
			}
		}

		const slot = this.getStaticAttributeValue('slot');
		if (slot && this.hasAncestor('Component')) {
			this.cannotUseInnerHTML();
			this.slotted = true;
			// TODO validate slots — no nesting, no dynamic names...
			const component = this.findNearest(/^Component/);
			component._slots.add(slot);
		}

		if (this.spread) {
			block.addDependencies(this.spread.metadata.dependencies);
		}

		this.var = block.getUniqueName(
			this.name.replace(/[^a-zA-Z0-9_$]/g, '_')
		);

		if (this.children.length) {
			if (this.name === 'pre' || this.name === 'textarea') stripWhitespace = false;
			this.initChildren(block, stripWhitespace, nextSibling);
		}
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { generator } = this;

		if (this.name === 'slot') {
			const slotName = this.getStaticAttributeValue('name') || 'default';
			this.generator.slots.add(slotName);
		}

		if (this.name === 'noscript') return;

		const childState = {
			parentNode: this.var,
			parentNodes: parentNodes && block.getUniqueName(`${this.var}_nodes`) // if we're in unclaimable territory, i.e. <head>, parentNodes is null
		};

		const name = this.var;
		const allUsedContexts: Set<string> = new Set();

		const slot = this.attributes.find((attribute: Node) => attribute.name === 'slot');
		const initialMountNode = this.slotted ?
			`${this.findNearest(/^Component/).var}._slotted.${slot.value[0].data}` : // TODO this looks bonkers
			parentNode;

		block.addVariable(name);
		const renderStatement = getRenderStatement(this.generator, this.namespace, this.name);
		block.builders.create.addLine(
			`${name} = ${renderStatement};`
		);

		if (this.generator.hydratable) {
			if (parentNodes) {
				block.builders.claim.addBlock(deindent`
					${name} = ${getClaimStatement(generator, this.namespace, parentNodes, this)};
					var ${childState.parentNodes} = @children(${name});
				`);
			} else {
				block.builders.claim.addLine(
					`${name} = ${renderStatement};`
				);
			}
		}

		if (initialMountNode) {
			block.builders.mount.addLine(
				`@appendNode(${name}, ${initialMountNode});`
			);

			if (initialMountNode === 'document.head') {
				block.builders.unmount.addLine(`@detachNode(${name});`);
			}
		} else {
			block.builders.mount.addLine(`@insertNode(${name}, #target, anchor);`);

			// TODO we eventually need to consider what happens to elements
			// that belong to the same outgroup as an outroing element...
			block.builders.unmount.addLine(`@detachNode(${name});`);
		}

		// TODO move this into a class as well?
		if (this._cssRefAttribute) {
			block.builders.hydrate.addLine(
				`@setAttribute(${name}, "svelte-ref-${this._cssRefAttribute}", "");`
			)
		}

		// insert static children with textContent or innerHTML
		if (!this.namespace && this.canUseInnerHTML && this.children.length > 0) {
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
				child.build(block, childState.parentNode, childState.parentNodes);
			});
		}

		this.addBindings(block, allUsedContexts);
		const eventHandlerUsesComponent = this.addEventHandlers(block, allUsedContexts);
		this.addRefs(block);
		this.addTransitions(block);
		this.addActions(block);

		if (this.attributes.find(attr => attr.type === 'Spread')) {
			this.addSpreadAttributes(block);
		} else {
			this.addAttributes(block);
		}

		if (allUsedContexts.size || eventHandlerUsesComponent) {
			const initialProps: string[] = [];
			const updates: string[] = [];

			if (eventHandlerUsesComponent) {
				initialProps.push(`component: #component`);
			}

			allUsedContexts.forEach((contextName: string) => {
				if (contextName === 'state') return;
				if (block.contextTypes.get(contextName) !== 'each') return;

				const listName = block.listNames.get(contextName);
				const indexName = block.indexNames.get(contextName);

				initialProps.push(
					`${listName}: state.${listName},\n${indexName}: state.${indexName}`
				);
				updates.push(
					`${name}._svelte.${listName} = state.${listName};\n${name}._svelte.${indexName} = state.${indexName};`
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

		if (childState.parentNodes) {
			block.builders.claim.addLine(
				`${childState.parentNodes}.forEach(@detachNode);`
			);
		}

		function toHTML(node: Element | Text) {
			if (node.type === 'Text') {
				return node.parent &&
					node.parent.type === 'Element' &&
					(node.parent.name === 'script' || node.parent.name === 'style')
					? node.data
					: escapeHTML(node.data);
			}

			if (node.name === 'noscript') return '';

			let open = `<${node.name}`;

			if (node._cssRefAttribute) {
				open += ` svelte-ref-${node._cssRefAttribute}`;
			}

			node.attributes.forEach((attr: Node) => {
				open += ` ${fixAttributeCasing(attr.name)}${stringifyAttributeValue(attr.value)}`
			});

			if (isVoidElementName(node.name)) return open + '>';

			return `${open}>${node.children.map(toHTML).join('')}</${node.name}>`;
		}
	}

	addBindings(
		block: Block,
		allUsedContexts: Set<string>
	) {
		const bindings: Binding[] = this.attributes.filter((a: Binding) => a.type === 'Binding');
		if (bindings.length === 0) return;

		if (this.name === 'select' || this.isMediaNode()) this.generator.hasComplexBindings = true;

		const needsLock = this.name !== 'input' || !/radio|checkbox|range|color/.test(this.getStaticAttributeValue('type'));

		const mungedBindings = bindings.map(binding => binding.munge(block, allUsedContexts));

		const lock = mungedBindings.some(binding => binding.needsLock) ?
			block.getUniqueName(`${this.var}_updating`) :
			null;

		if (lock) block.addVariable(lock, 'false');

		const groups = events
			.map(event => {
				return {
					events: event.eventNames,
					bindings: mungedBindings.filter(binding => event.filter(this, binding.name))
				};
			})
			.filter(group => group.bindings.length);

		groups.forEach(group => {
			const handler = block.getUniqueName(`${this.var}_${group.events.join('_')}_handler`);

			const needsLock = group.bindings.some(binding => binding.needsLock);

			group.bindings.forEach(binding => {
				if (!binding.updateDom) return;

				const updateConditions = needsLock ? [`!${lock}`] : [];
				if (binding.updateCondition) updateConditions.push(binding.updateCondition);

				block.builders.update.addLine(
					updateConditions.length ? `if (${updateConditions.join(' && ')}) ${binding.updateDom}` : binding.updateDom
				);
			});

			const usesContext = group.bindings.some(binding => binding.handler.usesContext);
			const usesState = group.bindings.some(binding => binding.handler.usesState);
			const usesStore = group.bindings.some(binding => binding.handler.usesStore);
			const mutations = group.bindings.map(binding => binding.handler.mutation).filter(Boolean).join('\n');

			const props = new Set();
			const storeProps = new Set();
			group.bindings.forEach(binding => {
				binding.handler.props.forEach(prop => {
					props.add(prop);
				});

				binding.handler.storeProps.forEach(prop => {
					storeProps.add(prop);
				});
			}); // TODO use stringifyProps here, once indenting is fixed

			// media bindings — awkward special case. The native timeupdate events
			// fire too infrequently, so we need to take matters into our
			// own hands
			let animation_frame;
			if (group.events[0] === 'timeupdate') {
				animation_frame = block.getUniqueName(`${this.var}_animationframe`);
				block.addVariable(animation_frame);
			}

			block.builders.init.addBlock(deindent`
				function ${handler}() {
					${
						animation_frame && deindent`
							cancelAnimationFrame(${animation_frame});
							if (!${this.var}.paused) ${animation_frame} = requestAnimationFrame(${handler});`
					}
					${usesContext && `var context = ${this.var}._svelte;`}
					${usesState && `var state = #component.get();`}
					${usesStore && `var $ = #component.store.get();`}
					${needsLock && `${lock} = true;`}
					${mutations.length > 0 && mutations}
					${props.size > 0 && `#component.set({ ${Array.from(props).join(', ')} });`}
					${storeProps.size > 0 && `#component.store.set({ ${Array.from(storeProps).join(', ')} });`}
					${needsLock && `${lock} = false;`}
				}
			`);

			group.events.forEach(name => {
				block.builders.hydrate.addLine(
					`@addListener(${this.var}, "${name}", ${handler});`
				);

				block.builders.destroy.addLine(
					`@removeListener(${this.var}, "${name}", ${handler});`
				);
			});

			const allInitialStateIsDefined = group.bindings
				.map(binding => `'${binding.object}' in state`)
				.join(' && ');

			if (this.name === 'select' || group.bindings.find(binding => binding.name === 'indeterminate' || binding.isReadOnlyMediaAttribute)) {
				this.generator.hasComplexBindings = true;

				block.builders.hydrate.addLine(
					`if (!(${allInitialStateIsDefined})) #component.root._beforecreate.push(${handler});`
				);
			}
		});

		this.initialUpdate = mungedBindings.map(binding => binding.initialUpdate).filter(Boolean).join('\n');
	}

	addAttributes(block: Block) {
		this.attributes.filter((a: Attribute) => a.type === 'Attribute').forEach((attribute: Attribute) => {
			attribute.render(block);
		});
	}

	addEventHandlers(block: Block, allUsedContexts) {
		const { generator } = this;
		let eventHandlerUsesComponent = false;

		this.attributes.filter((a: EventHandler) => a.type === 'EventHandler').forEach((attribute: EventHandler) => {
			const isCustomEvent = generator.events.has(attribute.name);
			const shouldHoist = !isCustomEvent && this.hasAncestor('EachBlock');

			const context = shouldHoist ? null : this.var;
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
					if (shouldHoist) eventHandlerUsesComponent = true; // this feels a bit hacky but it works!
				}

				attribute.expression.arguments.forEach((arg: Node) => {
					const { contexts } = block.contextualise(arg, context, true);

					contexts.forEach(context => {
						if (!~usedContexts.indexOf(context)) usedContexts.push(context);
						allUsedContexts.add(context);
					});
				});
			}

			const ctx = context || 'this';
			const declarations = usedContexts
				.map(name => {
					if (name === 'state') {
						if (shouldHoist) eventHandlerUsesComponent = true;
						return `var state = ${block.alias('component')}.get();`;
					}

					const contextType = block.contextTypes.get(name);
					if (contextType === 'each') {
						const listName = block.listNames.get(name);
						const indexName = block.indexNames.get(name);
						const contextName = block.contexts.get(name);

						return `var ${listName} = ${ctx}._svelte.${listName}, ${indexName} = ${ctx}._svelte.${indexName}, ${contextName} = ${listName}[${indexName}];`;
					}
				})
				.filter(Boolean);

			// get a name for the event handler that is globally unique
			// if hoisted, locally unique otherwise
			const handlerName = (shouldHoist ? generator : block).getUniqueName(
				`${attribute.name.replace(/[^a-zA-Z0-9_$]/g, '_')}_handler`
			);

			// create the handler body
			const handlerBody = deindent`
				${eventHandlerUsesComponent &&
					`var ${block.alias('component')} = ${ctx}._svelte.component;`}
				${declarations}
				${attribute.expression ?
					`[✂${attribute.expression.start}-${attribute.expression.end}✂];` :
					`${block.alias('component')}.fire("${attribute.name}", event);`}
			`;

			if (isCustomEvent) {
				block.addVariable(handlerName);

				block.builders.hydrate.addBlock(deindent`
					${handlerName} = %events-${attribute.name}.call(#component, ${this.var}, function(event) {
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
					`@addListener(${this.var}, "${attribute.name}", ${handlerName});`
				);

				block.builders.destroy.addLine(
					`@removeListener(${this.var}, "${attribute.name}", ${handlerName});`
				);
			}
		});
		return eventHandlerUsesComponent;
	}

	addRefs(block: Block) {
		this.attributes.filter((a: Ref) => a.type === 'Ref').forEach((attribute: Ref) => {
			const ref = `#component.refs.${attribute.name}`;

			block.builders.mount.addLine(
				`${ref} = ${this.var};`
			);

			block.builders.destroy.addLine(
				`if (${ref} === ${this.var}) ${ref} = null;`
			);

			this.generator.usesRefs = true; // so component.refs object is created
		});
	}

	addTransitions(
		block: Block
	) {
		const intro = this.attributes.find((a: Transition) => a.type === 'Transition' && a.intro);
		const outro = this.attributes.find((a: Transition) => a.type === 'Transition' && a.outro);

		if (!intro && !outro) return;

		if (intro === outro) {
			block.contextualise(intro.expression); // TODO remove all these

			const name = block.getUniqueName(`${this.var}_transition`);
			const snippet = intro.expression
				? intro.metadata.snippet
				: '{}';

			block.addVariable(name);

			const fn = `%transitions-${intro.name}`;

			block.builders.intro.addBlock(deindent`
				#component.root._aftercreate.push(function() {
					if (!${name}) ${name} = @wrapTransition(#component, ${this.var}, ${fn}, ${snippet}, true, null);
					${name}.run(true, function() {
						#component.fire("intro.end", { node: ${this.var} });
					});
				});
			`);

			block.builders.outro.addBlock(deindent`
				${name}.run(false, function() {
					#component.fire("outro.end", { node: ${this.var} });
					if (--#outros === 0) #outrocallback();
					${name} = null;
				});
			`);
		} else {
			const introName = intro && block.getUniqueName(`${this.var}_intro`);
			const outroName = outro && block.getUniqueName(`${this.var}_outro`);

			if (intro) {
				block.contextualise(intro.expression);

				block.addVariable(introName);
				const snippet = intro.expression
					? intro.metadata.snippet
					: '{}';

				const fn = `%transitions-${intro.name}`; // TODO add built-in transitions?

				if (outro) {
					block.builders.intro.addBlock(deindent`
						if (${introName}) ${introName}.abort();
						if (${outroName}) ${outroName}.abort();
					`);
				}

				block.builders.intro.addBlock(deindent`
					#component.root._aftercreate.push(function() {
						${introName} = @wrapTransition(#component, ${this.var}, ${fn}, ${snippet}, true, null);
						${introName}.run(true, function() {
							#component.fire("intro.end", { node: ${this.var} });
						});
					});
				`);
			}

			if (outro) {
				block.contextualise(outro.expression);

				block.addVariable(outroName);
				const snippet = outro.expression
					? outro.metadata.snippet
					: '{}';

				const fn = `%transitions-${outro.name}`;

				// TODO hide elements that have outro'd (unless they belong to a still-outroing
				// group) prior to their removal from the DOM
				block.builders.outro.addBlock(deindent`
					${outroName} = @wrapTransition(#component, ${this.var}, ${fn}, ${snippet}, false, null);
					${outroName}.run(false, function() {
						#component.fire("outro.end", { node: ${this.var} });
						if (--#outros === 0) #outrocallback();
					});
				`);
			}
		}
	}

	addActions(block: Block) {
		this.attributes.filter((a: Action) => a.type === 'Action').forEach((attribute:Action) => {
			const { expression } = attribute;
			let snippet, dependencies;
			if (expression) {
				this.generator.addSourcemapLocations(expression);
				block.contextualise(expression);
				snippet = attribute.metadata.snippet;
				dependencies = attribute.metadata.dependencies;
			}

			const name = block.getUniqueName(
				`${attribute.name.replace(/[^a-zA-Z0-9_$]/g, '_')}_action`
			);

			block.addVariable(name);
			const fn = `%actions-${attribute.name}`;

			block.builders.hydrate.addLine(
				`${name} = ${fn}.call(#component, ${this.var}${snippet ? `, ${snippet}` : ''}) || {};`
			);

			if (dependencies && dependencies.length) {
				let conditional = `typeof ${name}.update === 'function' && `;
				const deps = dependencies.map(dependency => `changed.${dependency}`).join(' || ');
				conditional += dependencies.length > 1 ? `(${deps})` : deps;

				block.builders.update.addConditional(
					conditional,
					`${name}.update.call(#component, ${snippet});`
				);
			}

			block.builders.destroy.addLine(
				`if (typeof ${name}.destroy === 'function') ${name}.destroy.call(#component);`
			);
		});
	}

	getStaticAttributeValue(name: string) {
		const attribute = this.attributes.find(
			(attr: Attribute) => attr.type === 'Attribute' && attr.name.toLowerCase() === name
		);

		if (!attribute) return null;

		if (attribute.value === true) return true;
		if (attribute.value.length === 0) return '';

		if (attribute.value.length === 1 && attribute.value[0].type === 'Text') {
			return attribute.value[0].data;
		}

		return null;
	}

	isMediaNode() {
		return this.name === 'audio' || this.name === 'video';
	}

	remount(name: string) {
		const slot = this.attributes.find(attribute => attribute.name === 'slot');
		if (slot) {
			return `@appendNode(${this.var}, ${name}._slotted.${this.getStaticAttributeValue('slot')});`;
		}

		return `@appendNode(${this.var}, ${name}._slotted${this.generator.legacy ? `["default"]` : `.default`});`;
	}

	addCssClass() {
		const classAttribute = this.attributes.find(a => a.name === 'class');
		if (classAttribute && classAttribute.value !== true) {
			if (classAttribute.value.length === 1 && classAttribute.value[0].type === 'Text') {
				classAttribute.value[0].data += ` ${this.generator.stylesheet.id}`;
			} else {
				(<Node[]>classAttribute.value).push(
					new Node({ type: 'Text', data: ` ${this.generator.stylesheet.id}` })
				);
			}
		} else {
			this.attributes.push(
				new Attribute({
					generator: this.generator,
					name: 'class',
					value: [new Node({ type: 'Text', data: `${this.generator.stylesheet.id}` })],
					parent: this,
				})
			);
		}
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

const events = [
	{
		eventNames: ['input'],
		filter: (node: Element, name: string) =>
			node.name === 'textarea' ||
			node.name === 'input' && !/radio|checkbox/.test(node.getStaticAttributeValue('type'))
	},
	{
		eventNames: ['change'],
		filter: (node: Element, name: string) =>
			node.name === 'select' ||
			node.name === 'input' && /radio|checkbox|range/.test(node.getStaticAttributeValue('type'))
	},

	// media events
	{
		eventNames: ['timeupdate'],
		filter: (node: Element, name: string) =>
			node.isMediaNode() &&
			(name === 'currentTime' || name === 'played')
	},
	{
		eventNames: ['durationchange'],
		filter: (node: Element, name: string) =>
			node.isMediaNode() &&
			name === 'duration'
	},
	{
		eventNames: ['play', 'pause'],
		filter: (node: Element, name: string) =>
			node.isMediaNode() &&
			name === 'paused'
	},
	{
		eventNames: ['progress'],
		filter: (node: Element, name: string) =>
			node.isMediaNode() &&
			name === 'buffered'
	},
	{
		eventNames: ['loadedmetadata'],
		filter: (node: Element, name: string) =>
			node.isMediaNode() &&
			(name === 'buffered' || name === 'seekable')
	},
	{
		eventNames: ['volumechange'],
		filter: (node: Element, name: string) =>
			node.isMediaNode() &&
			name === 'volume'
	}
];
