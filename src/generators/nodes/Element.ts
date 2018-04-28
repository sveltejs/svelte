import deindent from '../../utils/deindent';
import { stringify, escapeHTML } from '../../utils/stringify';
import flattenReference from '../../utils/flattenReference';
import isVoidElementName from '../../utils/isVoidElementName';
import validCalleeObjects from '../../utils/validCalleeObjects';
import reservedNames from '../../utils/reservedNames';
import fixAttributeCasing from '../../utils/fixAttributeCasing';
import quoteIfNecessary from '../../utils/quoteIfNecessary';
import Node from './shared/Node';
import Block from '../dom/Block';
import Attribute from './Attribute';
import Binding from './Binding';
import EventHandler from './EventHandler';
import Transition from './Transition';
import Action from './Action';
import Text from './Text';
import * as namespaces from '../../utils/namespaces';
import mapChildren from './shared/mapChildren';

// source: https://gist.github.com/ArjanSchouten/0b8574a6ad7f5065a5e7
const booleanAttributes = new Set('async autocomplete autofocus autoplay border challenge checked compact contenteditable controls default defer disabled formnovalidate frameborder hidden indeterminate ismap loop multiple muted nohref noresize noshade novalidate nowrap open readonly required reversed scoped scrolling seamless selected sortable spellcheck translate'.split(' '));

export default class Element extends Node {
	type: 'Element';
	name: string;
	scope: any; // TODO
	attributes: Attribute[];
	actions: Action[];
	bindings: Binding[];
	handlers: EventHandler[];
	intro: Transition;
	outro: Transition;
	children: Node[];

	ref: string;
	namespace: string;

	constructor(compiler, parent, scope, info: any) {
		super(compiler, parent, scope, info);
		this.name = info.name;
		this.scope = scope;

		const parentElement = parent.findNearest(/^Element/);
		this.namespace = this.name === 'svg' ?
			namespaces.svg :
			parentElement ? parentElement.namespace : this.compiler.namespace;

		this.attributes = [];
		this.actions = [];
		this.bindings = [];
		this.handlers = [];

		this.intro = null;
		this.outro = null;

		if (this.name === 'textarea') {
			// this is an egregious hack, but it's the easiest way to get <textarea>
			// children treated the same way as a value attribute
			if (info.children.length > 0) {
				info.attributes.push({
					type: 'Attribute',
					name: 'value',
					value: info.children
				});

				info.children = [];
			}
		}

		if (this.name === 'option') {
			// Special case — treat these the same way:
			//   <option>{foo}</option>
			//   <option value={foo}>{foo}</option>
			const valueAttribute = info.attributes.find((attribute: Node) => attribute.name === 'value');

			if (!valueAttribute) {
				info.attributes.push({
					type: 'Attribute',
					name: 'value',
					value: info.children,
					synthetic: true
				});
			}
		}

		info.attributes.forEach(node => {
			switch (node.type) {
				case 'Action':
					this.actions.push(new Action(compiler, this, scope, node));
					break;

				case 'Attribute':
				case 'Spread':
					// special case
					if (node.name === 'xmlns') this.namespace = node.value[0].data;

					this.attributes.push(new Attribute(compiler, this, scope, node));
					break;

				case 'Binding':
					this.bindings.push(new Binding(compiler, this, scope, node));
					break;

				case 'EventHandler':
					this.handlers.push(new EventHandler(compiler, this, scope, node));
					break;

				case 'Transition':
					const transition = new Transition(compiler, this, scope, node);
					if (node.intro) this.intro = transition;
					if (node.outro) this.outro = transition;
					break;

				case 'Ref':
					// TODO catch this in validation
					if (this.ref) throw new Error(`Duplicate refs`);

					compiler.usesRefs = true
					this.ref = node.name;
					break;

				default:
					throw new Error(`Not implemented: ${node.type}`);
			}
		});

		// TODO break out attributes and directives here

		this.children = mapChildren(compiler, this, scope, info.children);

		compiler.stylesheet.apply(this);
	}

	init(
		block: Block,
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		if (this.name === 'slot' || this.name === 'option') {
			this.cannotUseInnerHTML();
		}

		this.attributes.forEach(attr => {
			if (attr.dependencies.size) {
				this.parent.cannotUseInnerHTML();
				block.addDependencies(attr.dependencies);

				// special case — <option value={foo}> — see below
				if (this.name === 'option' && attr.name === 'value') {
					let select = this.parent;
					while (select && (select.type !== 'Element' || select.name !== 'select')) select = select.parent;

					if (select && select.selectBindingDependencies) {
						select.selectBindingDependencies.forEach(prop => {
							attr.dependencies.forEach((dependency: string) => {
								this.compiler.indirectDependencies.get(prop).add(dependency);
							});
						});
					}
				}
			}
		});

		this.actions.forEach(action => {
			this.parent.cannotUseInnerHTML();
			if (action.expression) {
				block.addDependencies(action.expression.dependencies);
			}
		});

		this.bindings.forEach(binding => {
			this.parent.cannotUseInnerHTML();
			block.addDependencies(binding.value.dependencies);
		});

		this.handlers.forEach(handler => {
			this.parent.cannotUseInnerHTML();
			block.addDependencies(handler.dependencies);
		});

		if (this.intro) {
			this.parent.cannotUseInnerHTML();
			this.compiler.hasIntroTransitions = block.hasIntroMethod = true;
		}

		if (this.outro) {
			this.parent.cannotUseInnerHTML();
			this.compiler.hasOutroTransitions = block.hasOutroMethod = true;
			block.outros += 1;
		}

		const valueAttribute = this.attributes.find((attribute: Attribute) => attribute.name === 'value');

		// special case — in a case like this...
		//
		//   <select bind:value='foo'>
		//     <option value='{bar}'>bar</option>
		//     <option value='{baz}'>baz</option>
		//   </option>
		//
		// ...we need to know that `foo` depends on `bar` and `baz`,
		// so that if `foo.qux` changes, we know that we need to
		// mark `bar` and `baz` as dirty too
		if (this.name === 'select') {
			const binding = this.bindings.find(node => node.name === 'value');
			if (binding) {
				// TODO does this also apply to e.g. `<input type='checkbox' bind:group='foo'>`?
				const dependencies = binding.value.dependencies;
				this.selectBindingDependencies = dependencies;
				dependencies.forEach((prop: string) => {
					this.compiler.indirectDependencies.set(prop, new Set());
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
		const { compiler } = this;

		if (this.name === 'slot') {
			const slotName = this.getStaticAttributeValue('name') || 'default';
			this.compiler.slots.add(slotName);
		}

		if (this.name === 'noscript') return;

		const childState = {
			parentNode: this.var,
			parentNodes: parentNodes && block.getUniqueName(`${this.var}_nodes`) // if we're in unclaimable territory, i.e. <head>, parentNodes is null
		};

		const name = this.var;

		const slot = this.attributes.find((attribute: Node) => attribute.name === 'slot');
		const initialMountNode = this.slotted ?
			`${this.findNearest(/^Component/).var}._slotted.${slot.chunks[0].data}` : // TODO this looks bonkers
			parentNode;

		block.addVariable(name);
		const renderStatement = getRenderStatement(this.compiler, this.namespace, this.name);
		block.builders.create.addLine(
			`${name} = ${renderStatement};`
		);

		if (this.compiler.hydratable) {
			if (parentNodes) {
				block.builders.claim.addBlock(deindent`
					${name} = ${getClaimStatement(compiler, this.namespace, parentNodes, this)};
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

		let hasHoistedEventHandlerOrBinding = (
			//(this.hasAncestor('EachBlock') && this.bindings.length > 0) ||
			this.handlers.some(handler => handler.shouldHoist)
		);
		const eventHandlerOrBindingUsesComponent = (
			this.bindings.length > 0 ||
			this.handlers.some(handler => handler.usesComponent)
		);

		const eventHandlerOrBindingUsesContext = (
			this.bindings.some(binding => binding.usesContext) ||
			this.handlers.some(handler => handler.usesContext)
		);

		if (hasHoistedEventHandlerOrBinding) {
			const initialProps: string[] = [];
			const updates: string[] = [];

			if (eventHandlerOrBindingUsesComponent) {
				const component = block.alias('component');
				initialProps.push(component === 'component' ? 'component' : `component: ${component}`);
			}

			if (eventHandlerOrBindingUsesContext) {
				initialProps.push(`ctx`);
				block.builders.update.addLine(`${name}._svelte.ctx = ctx;`);
			}

			if (initialProps.length) {
				block.builders.hydrate.addBlock(deindent`
					${name}._svelte = { ${initialProps.join(', ')} };
				`);
			}
		} else {
			if (eventHandlerOrBindingUsesContext) {
				block.maintainContext = true;
			}
		}

		this.addBindings(block);
		this.addEventHandlers(block);
		if (this.ref) this.addRef(block);
		this.addAttributes(block);
		this.addTransitions(block);
		this.addActions(block);

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
				open += ` ${fixAttributeCasing(attr.name)}${stringifyAttributeValue(attr.chunks)}`
			});

			if (isVoidElementName(node.name)) return open + '>';

			return `${open}>${node.children.map(toHTML).join('')}</${node.name}>`;
		}
	}

	addBindings(
		block: Block
	) {
		if (this.bindings.length === 0) return;

		if (this.name === 'select' || this.isMediaNode()) this.compiler.hasComplexBindings = true;

		const needsLock = this.name !== 'input' || !/radio|checkbox|range|color/.test(this.getStaticAttributeValue('type'));

		// TODO munge in constructor
		const mungedBindings = this.bindings.map(binding => binding.munge(block));

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
				.map(binding => `'${binding.object}' in ctx`)
				.join(' && ');

			if (this.name === 'select' || group.bindings.find(binding => binding.name === 'indeterminate' || binding.isReadOnlyMediaAttribute)) {
				this.compiler.hasComplexBindings = true;

				block.builders.hydrate.addLine(
					`if (!(${allInitialStateIsDefined})) #component.root._beforecreate.push(${handler});`
				);
			}
		});

		this.initialUpdate = mungedBindings.map(binding => binding.initialUpdate).filter(Boolean).join('\n');
	}

	addAttributes(block: Block) {
		if (this.attributes.find(attr => attr.type === 'Spread')) {
			this.addSpreadAttributes(block);
			return;
		}

		this.attributes.forEach((attribute: Attribute) => {
			attribute.render(block);
		});
	}

	addSpreadAttributes(block: Block) {
		const levels = block.getUniqueName(`${this.var}_levels`);
		const data = block.getUniqueName(`${this.var}_data`);

		const initialProps = [];
		const updates = [];

		this.attributes
			.filter(attr => attr.type === 'Attribute' || attr.type === 'Spread')
			.forEach(attr => {
				const condition = attr.dependencies.size > 0
					? [...attr.dependencies].map(d => `changed.${d}`).join(' || ')
					: null;

				if (attr.isSpread) {
					const { snippet, dependencies } = attr.expression;

					initialProps.push(snippet);

					updates.push(condition ? `${condition} && ${snippet}` : snippet);
				} else {
					const snippet = `{ ${quoteIfNecessary(attr.name)}: ${attr.getValue()} }`;
					initialProps.push(snippet);

					updates.push(condition ? `${condition} && ${snippet}` : snippet);
				}
			});

		block.builders.init.addBlock(deindent`
			var ${levels} = [
				${initialProps.join(',\n')}
			];

			var ${data} = {};
			for (var #i = 0; #i < ${levels}.length; #i += 1) {
				${data} = @assign(${data}, ${levels}[#i]);
			}
		`);

		block.builders.hydrate.addLine(
			`@setAttributes(${this.var}, ${data});`
		);

		block.builders.update.addBlock(deindent`
			@setAttributes(${this.var}, @getSpreadUpdate(${levels}, [
				${updates.join(',\n')}
			]));
		`);
	}

	addEventHandlers(block: Block) {
		const { compiler } = this;

		this.handlers.forEach(handler => {
			const isCustomEvent = compiler.events.has(handler.name);

			if (handler.callee) {
				handler.render(this.compiler, block, handler.shouldHoist);
			}

			const target = handler.shouldHoist ? 'this' : this.var;

			// get a name for the event handler that is globally unique
			// if hoisted, locally unique otherwise
			const handlerName = (handler.shouldHoist ? compiler : block).getUniqueName(
				`${handler.name.replace(/[^a-zA-Z0-9_$]/g, '_')}_handler`
			);

			const component = block.alias('component'); // can't use #component, might be hoisted

			// create the handler body
			const handlerBody = deindent`
				${handler.shouldHoist && (
					handler.usesComponent || handler.usesContext
						? `const { ${[handler.usesComponent && 'component', handler.usesContext && 'ctx'].filter(Boolean).join(', ')} } = ${target}._svelte;`
						: null
				)}

				${handler.snippet ?
					handler.snippet :
					`${component}.fire("${handler.name}", event);`}
			`;

			if (isCustomEvent) {
				block.addVariable(handlerName);

				block.builders.hydrate.addBlock(deindent`
					${handlerName} = %events-${handler.name}.call(${component}, ${this.var}, function(event) {
						${handlerBody}
					});
				`);

				block.builders.destroy.addLine(deindent`
					${handlerName}.destroy();
				`);
			} else {
				const handlerFunction = deindent`
					function ${handlerName}(event) {
						${handlerBody}
					}
				`;

				if (handler.shouldHoist) {
					compiler.blocks.push(handlerFunction);
				} else {
					block.builders.init.addBlock(handlerFunction);
				}

				block.builders.hydrate.addLine(
					`@addListener(${this.var}, "${handler.name}", ${handlerName});`
				);

				block.builders.destroy.addLine(
					`@removeListener(${this.var}, "${handler.name}", ${handlerName});`
				);
			}
		});
	}

	addRef(block: Block) {
		const ref = `#component.refs.${this.ref}`;

		block.builders.mount.addLine(
			`${ref} = ${this.var};`
		);

		block.builders.destroy.addLine(
			`if (${ref} === ${this.var}) ${ref} = null;`
		);
	}

	addTransitions(
		block: Block
	) {
		const { intro, outro } = this;

		if (!intro && !outro) return;

		if (intro === outro) {
			const name = block.getUniqueName(`${this.var}_transition`);
			const snippet = intro.expression
				? intro.expression.snippet
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
				block.addVariable(introName);
				const snippet = intro.expression
					? intro.expression.snippet
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
				block.addVariable(outroName);
				const snippet = outro.expression
					? outro.expression.snippet
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
		this.actions.forEach(action => {
			const { expression } = action;
			let snippet, dependencies;
			if (expression) {
				snippet = action.expression.snippet;
				dependencies = action.expression.dependencies;
			}

			const name = block.getUniqueName(
				`${action.name.replace(/[^a-zA-Z0-9_$]/g, '_')}_action`
			);

			block.addVariable(name);
			const fn = `%actions-${action.name}`;

			block.builders.hydrate.addLine(
				`${name} = ${fn}.call(#component, ${this.var}${snippet ? `, ${snippet}` : ''}) || {};`
			);

			if (dependencies && dependencies.size > 0) {
				let conditional = `typeof ${name}.update === 'function' && `;
				const deps = [...dependencies].map(dependency => `changed.${dependency}`).join(' || ');
				conditional += dependencies.size > 1 ? `(${deps})` : deps;

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

		if (attribute.isTrue) return true;
		if (attribute.chunks.length === 0) return '';

		if (attribute.chunks.length === 1 && attribute.chunks[0].type === 'Text') {
			return attribute.chunks[0].data;
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

		return `@appendNode(${this.var}, ${name}._slotted.default);`;
	}

	addCssClass() {
		const classAttribute = this.attributes.find(a => a.name === 'class');
		if (classAttribute && !classAttribute.isTrue) {
			if (classAttribute.chunks.length === 1 && classAttribute.chunks[0].type === 'Text') {
				(<Text>classAttribute.chunks[0]).data += ` ${this.compiler.stylesheet.id}`;
			} else {
				(<Node[]>classAttribute.chunks).push(
					new Text(this.compiler, this, this.scope, {
						type: 'Text',
						data: ` ${this.compiler.stylesheet.id}`
					})

					// new Text({ type: 'Text', data: ` ${this.compiler.stylesheet.id}` })
				);
			}
		} else {
			this.attributes.push(
				new Attribute(this.compiler, this, this.scope, {
					type: 'Attribute',
					name: 'class',
					value: [{ type: 'Text', data: `${this.compiler.stylesheet.id}` }]
				})
			);
		}
	}

	ssr() {
		const { compiler } = this;

		let openingTag = `<${this.name}`;
		let textareaContents; // awkward special case

		const slot = this.getStaticAttributeValue('slot');
		if (slot && this.hasAncestor('Component')) {
			const slot = this.attributes.find((attribute: Node) => attribute.name === 'slot');
			const slotName = slot.chunks[0].data;
			const appendTarget = compiler.appendTargets[compiler.appendTargets.length - 1];
			appendTarget.slotStack.push(slotName);
			appendTarget.slots[slotName] = '';
		}

		if (this.attributes.find(attr => attr.isSpread)) {
			// TODO dry this out
			const args = [];
			this.attributes.forEach(attribute => {
				if (attribute.isSpread) {
					args.push(attribute.expression.snippet);
				} else {
					if (attribute.name === 'value' && this.name === 'textarea') {
						textareaContents = attribute.stringifyForSsr();
					} else if (attribute.isTrue) {
						args.push(`{ ${quoteIfNecessary(attribute.name)}: true }`);
					} else if (
						booleanAttributes.has(attribute.name) &&
						attribute.chunks.length === 1 &&
						attribute.chunks[0].type !== 'Text'
					) {
						// a boolean attribute with one non-Text chunk
						args.push(`{ ${quoteIfNecessary(attribute.name)}: ${attribute.chunks[0].snippet} }`);
					} else {
						args.push(`{ ${quoteIfNecessary(attribute.name)}: \`${attribute.stringifyForSsr()}\` }`);
					}
				}
			});

			openingTag += "${@spread([" + args.join(', ') + "])}";
		} else {
			this.attributes.forEach((attribute: Node) => {
				if (attribute.type !== 'Attribute') return;

				if (attribute.name === 'value' && this.name === 'textarea') {
					textareaContents = attribute.stringifyForSsr();
				} else if (attribute.isTrue) {
					openingTag += ` ${attribute.name}`;
				} else if (
					booleanAttributes.has(attribute.name) &&
					attribute.chunks.length === 1 &&
					attribute.chunks[0].type !== 'Text'
				) {
					// a boolean attribute with one non-Text chunk
					openingTag += '${' + attribute.chunks[0].snippet + ' ? " ' + attribute.name + '" : "" }';
				} else {
					openingTag += ` ${attribute.name}="${attribute.stringifyForSsr()}"`;
				}
			});
		}

		if (this._cssRefAttribute) {
			openingTag += ` svelte-ref-${this._cssRefAttribute}`;
		}

		openingTag += '>';

		compiler.append(openingTag);

		if (this.name === 'textarea' && textareaContents !== undefined) {
			compiler.append(textareaContents);
		} else {
			this.children.forEach((child: Node) => {
				child.ssr();
			});
		}

		if (!isVoidElementName(this.name)) {
			compiler.append(`</${this.name}>`);
		}
	}
}

function getRenderStatement(
	compiler: DomGenerator,
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
	compiler: DomGenerator,
	namespace: string,
	nodes: string,
	node: Node
) {
	const attributes = node.attributes
		.filter((attr: Node) => attr.type === 'Attribute')
		.map((attr: Node) => `${quoteIfNecessary(attr.name)}: true`)
		.join(', ');

	const name = namespace ? node.name : node.name.toUpperCase();

	return `@claimElement(${nodes}, "${name}", ${attributes
		? `{ ${attributes} }`
		: `{}`}, ${namespace === namespaces.svg ? true : false})`;
}

function stringifyAttributeValue(value: Node[] | true) {
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
