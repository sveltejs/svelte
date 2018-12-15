import Renderer from '../../Renderer';
import Element from '../../../nodes/Element';
import Wrapper from '../shared/Wrapper';
import Block from '../../Block';
import Node from '../../../nodes/shared/Node';
import { quotePropIfNecessary, quoteNameIfNecessary } from '../../../../utils/quoteIfNecessary';
import isVoidElementName from '../../../../utils/isVoidElementName';
import FragmentWrapper from '../Fragment';
import { stringify, escapeHTML, escape } from '../../../../utils/stringify';
import TextWrapper from '../Text';
import fixAttributeCasing from '../../../../utils/fixAttributeCasing';
import deindent from '../../../../utils/deindent';
import namespaces from '../../../../utils/namespaces';
import AttributeWrapper from './Attribute';
import StyleAttributeWrapper from './StyleAttribute';
import { dimensions } from '../../../../utils/patterns';
import Binding from './Binding';
import InlineComponentWrapper from '../InlineComponent';

const events = [
	{
		eventNames: ['input'],
		filter: (node: Element, name: string) =>
			node.name === 'textarea' ||
			node.name === 'input' && !/radio|checkbox|range/.test(node.getStaticAttributeValue('type'))
	},
	{
		eventNames: ['change'],
		filter: (node: Element, name: string) =>
			node.name === 'select' ||
			node.name === 'input' && /radio|checkbox/.test(node.getStaticAttributeValue('type'))
	},
	{
		eventNames: ['change', 'input'],
		filter: (node: Element, name: string) =>
			node.name === 'input' && node.getStaticAttributeValue('type') === 'range'
	},

	{
		eventNames: ['resize'],
		filter: (node: Element, name: string) =>
			dimensions.test(name)
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

export default class ElementWrapper extends Wrapper {
	node: Element;
	fragment: FragmentWrapper;
	attributes: AttributeWrapper[];
	bindings: Binding[];
	classDependencies: string[];
	initialUpdate: string;

	slotOwner?: InlineComponentWrapper;
	selectBindingDependencies?: Set<string>;

	var: string;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: Element,
		stripWhitespace: boolean,
		nextSibling: Wrapper
	) {
		super(renderer, block, parent, node);
		this.var = node.name.replace(/[^a-zA-Z0-9_$]/g, '_')

		this.classDependencies = [];

		this.attributes = this.node.attributes.map(attribute => {
			if (attribute.name === 'slot') {
				// TODO make separate subclass for this?
				let owner = this.parent;
				while (owner) {
					if (owner.node.type === 'InlineComponent') {
						break;
					}

					if (owner.node.type === 'Element' && /-/.test(owner.node.name)) {
						break;
					}

					owner = owner.parent;
				}

				if (owner && owner.node.type === 'InlineComponent') {
					this.slotOwner = <InlineComponentWrapper>owner;
					owner._slots.add(attribute.getStaticValue());
				}
			}
			if (attribute.name === 'style') {
				return new StyleAttributeWrapper(this, block, attribute);
			}
			return new AttributeWrapper(this, block, attribute);
		});

		let has_bindings;
		const binding_lookup = {};
		this.node.bindings.forEach(binding => {
			binding_lookup[binding.name] = binding;
			has_bindings = true;
		});

		const type = this.node.getStaticAttributeValue('type');

		// ordinarily, there'll only be one... but we need to handle
		// the rare case where an element can have multiple bindings,
		// e.g. <audio bind:paused bind:currentTime>
		this.bindings = this.node.bindings.map(binding => new Binding(block, binding, this));

		// TODO remove this, it's just useful during refactoring
		if (has_bindings && !this.bindings.length) {
			throw new Error(`no binding was created`);
		}

		if (node.intro || node.outro) {
			if (node.intro) block.addIntro();
			if (node.outro) block.addOutro();
		}

		if (node.animation) {
			block.addAnimation();
		}

		// add directive and handler dependencies
		[node.animation, node.outro, ...node.actions, ...node.classes].forEach(directive => {
			if (directive && directive.expression) {
				block.addDependencies(directive.expression.dependencies);
			}
		});

		node.handlers.forEach(handler => {
			block.addDependencies(handler.dependencies);
		});

		if (this.parent) {
			if (node.actions.length > 0) this.parent.cannotUseInnerHTML();
			if (node.animation) this.parent.cannotUseInnerHTML();
			if (node.bindings.length > 0) this.parent.cannotUseInnerHTML();
			if (node.classes.length > 0) this.parent.cannotUseInnerHTML();
			if (node.intro || node.outro) this.parent.cannotUseInnerHTML();
			if (node.handlers.length > 0) this.parent.cannotUseInnerHTML();
			if (node.ref) this.parent.cannotUseInnerHTML();

			if (this.node.name === 'option') this.parent.cannotUseInnerHTML();

			if (renderer.options.dev) {
				this.parent.cannotUseInnerHTML(); // need to use addLoc
			}
		}

		this.fragment = new FragmentWrapper(renderer, block, node.children, this, stripWhitespace, nextSibling);
	}

	render(block: Block, parentNode: string, parentNodes: string) {
		const { renderer } = this;

		if (this.node.name === 'slot') {
			const slotName = this.getStaticAttributeValue('name') || 'default';
			renderer.slots.add(slotName);
		}

		if (this.node.name === 'noscript') return;

		const node = this.var;
		const nodes = parentNodes && block.getUniqueName(`${this.var}_nodes`) // if we're in unclaimable territory, i.e. <head>, parentNodes is null

		const slot = this.node.attributes.find((attribute: Node) => attribute.name === 'slot');
		const prop = slot && quotePropIfNecessary(slot.chunks[0].data);

		let initialMountNode;

		if (this.slotOwner) {
			initialMountNode = `${this.slotOwner.var}._slotted${prop}`;
		} else {
			initialMountNode = parentNode;
		}

		block.addVariable(node);
		const renderStatement = this.getRenderStatement();
		block.builders.create.addLine(
			`${node} = ${renderStatement};`
		);

		if (renderer.options.hydratable) {
			if (parentNodes) {
				block.builders.claim.addBlock(deindent`
					${node} = ${this.getClaimStatement(parentNodes)};
					var ${nodes} = @children(${this.node.name === 'template' ? `${node}.content` : node});
				`);
			} else {
				block.builders.claim.addLine(
					`${node} = ${renderStatement};`
				);
			}
		}

		if (initialMountNode) {
			block.builders.mount.addLine(
				`@append(${initialMountNode}, ${node});`
			);

			if (initialMountNode === 'document.head') {
				block.builders.destroy.addLine(`@detachNode(${node});`);
			}
		} else {
			block.builders.mount.addLine(`@insert(#target, ${node}, anchor);`);

			// TODO we eventually need to consider what happens to elements
			// that belong to the same outgroup as an outroing element...
			block.builders.destroy.addConditional('detach', `@detachNode(${node});`);
		}

		// insert static children with textContent or innerHTML
		if (!this.node.namespace && this.canUseInnerHTML && this.fragment.nodes.length > 0) {
			if (this.fragment.nodes.length === 1 && this.fragment.nodes[0].node.type === 'Text') {
				block.builders.create.addLine(
					`${node}.textContent = ${stringify(this.fragment.nodes[0].data)};`
				);
			} else {
				const innerHTML = escape(
					this.fragment.nodes
						.map(toHTML)
						.join('')
				);

				block.builders.create.addLine(
					`${node}.innerHTML = \`${innerHTML}\`;`
				);
			}
		} else {
			this.fragment.nodes.forEach((child: Wrapper) => {
				child.render(
					block,
					this.node.name === 'template' ? `${node}.content` : node,
					nodes
				);
			});
		}

		let hasHoistedEventHandlerOrBinding = (
			//(this.hasAncestor('EachBlock') && this.bindings.length > 0) ||
			this.node.handlers.some(handler => handler.shouldHoist)
		);
		const eventHandlerOrBindingUsesComponent = (
			this.bindings.length > 0 ||
			this.node.handlers.some(handler => handler.usesComponent)
		);

		const eventHandlerOrBindingUsesContext = (
			this.bindings.some(binding => binding.node.usesContext) ||
			this.node.handlers.some(handler => handler.usesContext)
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
				block.builders.update.addLine(`${node}._svelte.ctx = ctx;`);
				block.maintainContext = true;
			}

			if (initialProps.length) {
				block.builders.hydrate.addBlock(deindent`
					${node}._svelte = { ${initialProps.join(', ')} };
				`);
			}
		} else {
			if (eventHandlerOrBindingUsesContext) {
				block.maintainContext = true;
			}
		}

		this.addBindings(block);
		this.addEventHandlers(block);
		if (this.node.ref) this.addRef(block);
		this.addAttributes(block);
		this.addTransitions(block);
		this.addAnimation(block);
		this.addActions(block);
		this.addClasses(block);

		if (this.initialUpdate) {
			block.builders.mount.addBlock(this.initialUpdate);
		}

		if (nodes) {
			block.builders.claim.addLine(
				`${nodes}.forEach(@detachNode);`
			);
		}

		function toHTML(wrapper: ElementWrapper | TextWrapper) {
			if (wrapper.node.type === 'Text') {
				const { parent } = wrapper.node;

				const raw = parent && (
					parent.name === 'script' ||
					parent.name === 'style'
				);

				return raw
					? wrapper.node.data
					: escapeHTML(wrapper.node.data)
						.replace(/\\/g, '\\\\')
						.replace(/`/g, '\\`')
						.replace(/\$/g, '\\$');
			}

			if (wrapper.node.name === 'noscript') return '';

			let open = `<${wrapper.node.name}`;

			(<ElementWrapper>wrapper).attributes.forEach((attr: AttributeWrapper) => {
				open += ` ${fixAttributeCasing(attr.node.name)}${attr.stringify()}`
			});

			if (isVoidElementName(wrapper.node.name)) return open + '>';

			return `${open}>${wrapper.fragment.nodes.map(toHTML).join('')}</${wrapper.node.name}>`;
		}

		if (renderer.options.dev) {
			const loc = renderer.locate(this.node.start);
			block.builders.hydrate.addLine(
				`@addLoc(${this.var}, ${renderer.fileVar}, ${loc.line}, ${loc.column}, ${this.node.start});`
			);
		}
	}

	getRenderStatement() {
		const { name, namespace } = this.node;

		if (namespace === 'http://www.w3.org/2000/svg') {
			return `@createSvgElement("${name}")`;
		}

		if (namespace) {
			return `document.createElementNS("${namespace}", "${name}")`;
		}

		return `@createElement("${name}")`;
	}

	getClaimStatement(nodes: string) {
		const attributes = this.node.attributes
			.filter((attr: Node) => attr.type === 'Attribute')
			.map((attr: Node) => `${quoteNameIfNecessary(attr.name)}: true`)
			.join(', ');

		const name = this.node.namespace
			? this.node.name
			: this.node.name.toUpperCase();

		return `@claimElement(${nodes}, "${name}", ${attributes
			? `{ ${attributes} }`
			: `{}`}, ${this.node.namespace === namespaces.svg ? true : false})`;
	}

	addBindings(block: Block) {
		const { renderer } = this;

		if (this.bindings.length === 0) return;

		if (this.node.name === 'select' || this.isMediaNode()) {
			this.renderer.hasComplexBindings = true;
		}

		const needsLock = this.node.name !== 'input' || !/radio|checkbox|range|color/.test(this.getStaticAttributeValue('type'));

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
					bindings: mungedBindings.filter(binding => event.filter(this.node, binding.name))
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
				if (name === 'resize') {
					// special case
					const resize_listener = block.getUniqueName(`${this.var}_resize_listener`);
					block.addVariable(resize_listener);

					block.builders.mount.addLine(
						`${resize_listener} = @addResizeListener(${this.var}, ${handler});`
					);

					block.builders.destroy.addLine(
						`${resize_listener}.cancel();`
					);
				} else {
					block.builders.hydrate.addLine(
						`@addListener(${this.var}, "${name}", ${handler});`
					);

					block.builders.destroy.addLine(
						`@removeListener(${this.var}, "${name}", ${handler});`
					);
				}
			});

			const allInitialStateIsDefined = group.bindings
				.map(binding => `'${binding.object}' in ctx`)
				.join(' && ');

			if (this.node.name === 'select' || group.bindings.find(binding => binding.name === 'indeterminate' || binding.isReadOnlyMediaAttribute)) {
				renderer.hasComplexBindings = true;

				block.builders.hydrate.addLine(
					`if (!(${allInitialStateIsDefined})) #component.root._beforecreate.push(${handler});`
				);
			}

			if (group.events[0] === 'resize') {
				renderer.hasComplexBindings = true;

				block.builders.hydrate.addLine(
					`#component.root._aftercreate.push(${handler});`
				);
			}
		});

		this.initialUpdate = mungedBindings.map(binding => binding.initialUpdate).filter(Boolean).join('\n');
	}

	addAttributes(block: Block) {
		if (this.node.attributes.find(attr => attr.type === 'Spread')) {
			this.addSpreadAttributes(block);
			return;
		}

		this.attributes.forEach((attribute: Attribute) => {
			if (attribute.node.name === 'class' && attribute.node.isDynamic) {
				this.classDependencies.push(...attribute.node.dependencies);
			}
			attribute.render(block);
		});
	}

	addSpreadAttributes(block: Block) {
		const levels = block.getUniqueName(`${this.var}_levels`);
		const data = block.getUniqueName(`${this.var}_data`);

		const initialProps = [];
		const updates = [];

		this.node.attributes
			.filter(attr => attr.type === 'Attribute' || attr.type === 'Spread')
			.forEach(attr => {
				const condition = attr.dependencies.size > 0
					? `(${[...attr.dependencies].map(d => `changed.${d}`).join(' || ')})`
					: null;

				if (attr.isSpread) {
					const { snippet, dependencies } = attr.expression;

					initialProps.push(snippet);

					updates.push(condition ? `${condition} && ${snippet}` : snippet);
				} else {
					const snippet = `{ ${quoteNameIfNecessary(attr.name)}: ${attr.getValue()} }`;
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
		const { renderer } = this;
		const { component } = renderer;

		this.node.handlers.forEach(handler => {
			const isCustomEvent = component.events.has(handler.name);

			if (handler.callee) {
				// TODO move handler render method into a wrapper
				handler.render(this.renderer.component, block, this.var, handler.shouldHoist);
			}

			const target = handler.shouldHoist ? 'this' : this.var;

			// get a name for the event handler that is globally unique
			// if hoisted, locally unique otherwise
			const handlerName = (handler.shouldHoist ? component : block).getUniqueName(
				`${handler.name.replace(/[^a-zA-Z0-9_$]/g, '_')}_handler`
			);

			const component_name = block.alias('component'); // can't use #component, might be hoisted

			// create the handler body
			const handlerBody = deindent`
				${handler.shouldHoist && (
					handler.usesComponent || handler.usesContext
						? `const { ${[handler.usesComponent && 'component', handler.usesContext && 'ctx'].filter(Boolean).join(', ')} } = ${target}._svelte;`
						: null
				)}

				${handler.snippet ?
					handler.snippet :
					`${component_name}.fire("${handler.name}", event);`}
			`;

			if (isCustomEvent) {
				block.addVariable(handlerName);

				block.builders.hydrate.addBlock(deindent`
					${handlerName} = %events-${handler.name}.call(${component_name}, ${this.var}, function(event) {
						${handlerBody}
					});
				`);

				block.builders.destroy.addLine(deindent`
					${handlerName}.destroy();
				`);
			} else {
				const modifiers = [];
				if (handler.modifiers.has('preventDefault')) modifiers.push('event.preventDefault();');
				if (handler.modifiers.has('stopPropagation')) modifiers.push('event.stopPropagation();');

				const handlerFunction = deindent`
					function ${handlerName}(event) {
						${modifiers}
						${handlerBody}
					}
				`;

				if (handler.shouldHoist) {
					renderer.blocks.push(handlerFunction);
				} else {
					block.builders.init.addBlock(handlerFunction);
				}

				const opts = ['passive', 'once', 'capture'].filter(mod => handler.modifiers.has(mod));
				if (opts.length) {
					const optString = (opts.length === 1 && opts[0] === 'capture')
						? 'true'
						: `{ ${opts.map(opt => `${opt}: true`).join(', ')} }`;

					block.builders.hydrate.addLine(
						`@addListener(${this.var}, "${handler.name}", ${handlerName}, ${optString});`
					);

					block.builders.destroy.addLine(
						`@removeListener(${this.var}, "${handler.name}", ${handlerName}, ${optString});`
					);
				} else {
					block.builders.hydrate.addLine(
						`@addListener(${this.var}, "${handler.name}", ${handlerName});`
					);

					block.builders.destroy.addLine(
						`@removeListener(${this.var}, "${handler.name}", ${handlerName});`
					);
				}
			}
		});
	}

	addRef(block: Block) {
		const ref = `#component.refs.${this.node.ref.name}`;

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
		const { intro, outro } = this.node;

		if (!intro && !outro) return;

		if (intro === outro) {
			const name = block.getUniqueName(`${this.var}_transition`);
			const snippet = intro.expression
				? intro.expression.snippet
				: '{}';

			block.addVariable(name);

			const fn = `%transitions-${intro.name}`;

			block.builders.intro.addConditional(`#component.root._intro`, deindent`
				if (${name}) ${name}.invalidate();

				#component.root._aftercreate.push(() => {
					if (!${name}) ${name} = @wrapTransition(#component, ${this.var}, ${fn}, ${snippet}, true);
					${name}.run(1);
				});
			`);

			block.builders.outro.addBlock(deindent`
				if (!${name}) ${name} = @wrapTransition(#component, ${this.var}, ${fn}, ${snippet}, false);
				${name}.run(0, () => {
					#outrocallback();
					${name} = null;
				});
			`);

			block.builders.destroy.addConditional('detach', `if (${name}) ${name}.abort();`);
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
						if (${introName}) ${introName}.abort(1);
						if (${outroName}) ${outroName}.abort(1);
					`);
				}

				block.builders.intro.addConditional(`#component.root._intro`, deindent`
					#component.root._aftercreate.push(() => {
						${introName} = @wrapTransition(#component, ${this.var}, ${fn}, ${snippet}, true);
						${introName}.run(1);
					});
				`);
			}

			if (outro) {
				block.addVariable(outroName);
				const snippet = outro.expression
					? outro.expression.snippet
					: '{}';

				const fn = `%transitions-${outro.name}`;

				block.builders.intro.addBlock(deindent`
					if (${outroName}) ${outroName}.abort(1);
				`);

				// TODO hide elements that have outro'd (unless they belong to a still-outroing
				// group) prior to their removal from the DOM
				block.builders.outro.addBlock(deindent`
					${outroName} = @wrapTransition(#component, ${this.var}, ${fn}, ${snippet}, false);
					${outroName}.run(0, #outrocallback);
				`);

				block.builders.destroy.addConditional('detach', `if (${outroName}) ${outroName}.abort();`);
			}
		}
	}

	addAnimation(block: Block) {
		if (!this.node.animation) return;

		const rect = block.getUniqueName('rect');
		const animation = block.getUniqueName('animation');

		block.addVariable(rect);
		block.addVariable(animation);

		block.builders.measure.addBlock(deindent`
			${rect} = ${this.var}.getBoundingClientRect();
		`);

		block.builders.fix.addBlock(deindent`
			@fixPosition(${this.var});
			if (${animation}) ${animation}.stop();
		`);

		const params = this.node.animation.expression ? this.node.animation.expression.snippet : '{}';
		block.builders.animate.addBlock(deindent`
			if (${animation}) ${animation}.stop();
			${animation} = @wrapAnimation(${this.var}, ${rect}, %animations-${this.node.animation.name}, ${params});
		`);
	}

	addActions(block: Block) {
		this.node.actions.forEach(action => {
			const { expression } = action;
			let snippet, dependencies;
			if (expression) {
				snippet = expression.snippet;
				dependencies = expression.dependencies;
			}

			const name = block.getUniqueName(
				`${action.name.replace(/[^a-zA-Z0-9_$]/g, '_')}_action`
			);

			block.addVariable(name);
			const fn = `%actions-${action.name}`;

			block.builders.mount.addLine(
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
				`if (${name} && typeof ${name}.destroy === 'function') ${name}.destroy.call(#component);`
			);
		});
	}

	addClasses(block: Block) {
		this.node.classes.forEach(classDir => {
			const { expression, name } = classDir;
			let snippet, dependencies;
			if (expression) {
				snippet = expression.snippet;
				dependencies = expression.dependencies;
			} else {
				snippet = `ctx${quotePropIfNecessary(name)}`;
				dependencies = new Set([name]);
			}
			const updater = `@toggleClass(${this.var}, "${name}", ${snippet});`;

			block.builders.hydrate.addLine(updater);

			if ((dependencies && dependencies.size > 0) || this.classDependencies.length) {
				const allDeps = this.classDependencies.concat(...dependencies);
				const deps = allDeps.map(dependency => `changed${quotePropIfNecessary(dependency)}`).join(' || ');
				const condition = allDeps.length > 1 ? `(${deps})` : deps;

				block.builders.update.addConditional(
					condition,
					updater
				);
			}
		});
	}

	getStaticAttributeValue(name: string) {
		const attribute = this.node.attributes.find(
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
		return this.node.name === 'audio' || this.node.name === 'video';
	}

	remount(name: string) {
		const slot = this.attributes.find(attribute => attribute.name === 'slot');
		if (slot) {
			const prop = quotePropIfNecessary(slot.chunks[0].data);
			return `@append(${name}._slotted${prop}, ${this.var});`;
		}

		return `@append(${name}._slotted.default, ${this.var});`;
	}

	addCssClass(className = this.component.stylesheet.id) {
		const classAttribute = this.attributes.find(a => a.name === 'class');
		if (classAttribute && !classAttribute.isTrue) {
			if (classAttribute.chunks.length === 1 && classAttribute.chunks[0].type === 'Text') {
				(<Text>classAttribute.chunks[0]).data += ` ${className}`;
			} else {
				(<Node[]>classAttribute.chunks).push(
					new Text(this.component, this, this.scope, {
						type: 'Text',
						data: ` ${className}`
					})
				);
			}
		} else {
			this.attributes.push(
				new Attribute(this.component, this, this.scope, {
					type: 'Attribute',
					name: 'class',
					value: [{ type: 'Text', data: className }]
				})
			);
		}
	}
}