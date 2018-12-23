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
import { namespaces } from '../../../../utils/namespaces';
import AttributeWrapper from './Attribute';
import StyleAttributeWrapper from './StyleAttribute';
import { dimensions } from '../../../../utils/patterns';
import Binding from './Binding';
import InlineComponentWrapper from '../InlineComponent';
import addToSet from '../../../../utils/addToSet';
import addEventHandlers from '../shared/addEventHandlers';
import addActions from '../shared/addActions';

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
				block.addDependencies(directive.expression.dynamic_dependencies);
			}
		});

		node.handlers.forEach(handler => {
			if (handler.expression) {
				block.addDependencies(handler.expression.dynamic_dependencies);
			}
		});

		if (this.parent) {
			if (node.actions.length > 0) this.parent.cannotUseInnerHTML();
			if (node.animation) this.parent.cannotUseInnerHTML();
			if (node.bindings.length > 0) this.parent.cannotUseInnerHTML();
			if (node.classes.length > 0) this.parent.cannotUseInnerHTML();
			if (node.intro || node.outro) this.parent.cannotUseInnerHTML();
			if (node.handlers.length > 0) this.parent.cannotUseInnerHTML();

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
			initialMountNode = `${this.slotOwner.var}.$$.slotted${prop}`;
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

		const eventHandlerOrBindingUsesComponent = (
			this.bindings.length > 0 ||
			this.node.handlers.some(handler => handler.usesComponent)
		);

		const eventHandlerOrBindingUsesContext = (
			this.bindings.some(binding => binding.node.usesContext) ||
			this.node.handlers.some(handler => handler.usesContext) ||
			this.node.actions.some(action => action.usesContext)
		);

		if (eventHandlerOrBindingUsesContext) {
			block.maintainContext = true;
		}

		this.addBindings(block);
		this.addEventHandlers(block);
		this.addAttributes(block);
		this.addTransitions(block);
		this.addAnimation(block);
		this.addActions(block);
		this.addClasses(block);

		if (this.initialUpdate) {
			block.builders.mount.addBlock(this.initialUpdate);
		}

		if (nodes && this.renderer.options.hydratable) {
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

		renderer.component.has_reactive_assignments = true;

		const needsLock = this.node.name !== 'input' || !/radio|checkbox|range|color/.test(this.getStaticAttributeValue('type'));

		// TODO munge in constructor
		const mungedBindings = this.bindings.map(binding => binding.munge(block));

		const lock = mungedBindings.some(binding => binding.needsLock) ?
			block.getUniqueName(`${this.var}_updating`) :
			null;

		if (lock) block.addVariable(lock, 'false');

		const groups = events
			.map(event => ({
				events: event.eventNames,
				bindings: mungedBindings.filter(binding => event.filter(this.node, binding.name))
			}))
			.filter(group => group.bindings.length);

		groups.forEach(group => {
			const handler = block.getUniqueName(`${this.var}_${group.events.join('_')}_handler`);
			renderer.component.declarations.push(handler);
			renderer.component.template_references.add(handler);

			const needsLock = group.bindings.some(binding => binding.needsLock);

			const dependencies = new Set();
			const contextual_dependencies = new Set();

			group.bindings.forEach(binding => {
				// TODO this is a mess
				addToSet(dependencies, binding.dependencies);
				addToSet(contextual_dependencies, binding.contextual_dependencies);
				addToSet(contextual_dependencies, binding.handler.contextual_dependencies);

				if (!binding.updateDom) return;

				const updateConditions = needsLock ? [`!${lock}`] : [];
				if (binding.updateCondition) updateConditions.push(binding.updateCondition);

				block.builders.update.addLine(
					updateConditions.length ? `if (${updateConditions.join(' && ')}) ${binding.updateDom}` : binding.updateDom
				);
			});

			const mutations = group.bindings.map(binding => binding.handler.mutation).filter(Boolean).join('\n');

			// media bindings — awkward special case. The native timeupdate events
			// fire too infrequently, so we need to take matters into our
			// own hands
			let animation_frame;
			if (group.events[0] === 'timeupdate') {
				animation_frame = block.getUniqueName(`${this.var}_animationframe`);
				block.addVariable(animation_frame);
			}

			// TODO figure out how to handle locks

			let callee;

			// TODO dry this out — similar code for event handlers and component bindings
			if (contextual_dependencies.size > 0) {
				const deps = Array.from(contextual_dependencies);

				block.builders.init.addBlock(deindent`
					function ${handler}() {
						ctx.${handler}.call(this, ctx);
					}
				`);

				this.renderer.component.partly_hoisted.push(deindent`
					function ${handler}({ ${deps.join(', ')} }) {
						${
							animation_frame && deindent`
								cancelAnimationFrame(${animation_frame});
								if (!${this.var}.paused) ${animation_frame} = requestAnimationFrame(${handler});`
						}
						${mutations.length > 0 && mutations}
						${Array.from(dependencies).map(dep => `$$invalidate('${dep}', ${dep});`)}
					}
				`);

				callee = handler;
			} else {
				this.renderer.component.partly_hoisted.push(deindent`
					function ${handler}() {
						${
							animation_frame && deindent`
								cancelAnimationFrame(${animation_frame});
								if (!${this.var}.paused) ${animation_frame} = requestAnimationFrame(${handler});`
						}
						${mutations.length > 0 && mutations}
						${Array.from(dependencies).map(dep => `$$invalidate('${dep}', ${dep});`)}
					}
				`);

				callee = `ctx.${handler}`;
			}

			group.events.forEach(name => {
				if (name === 'resize') {
					// special case
					const resize_listener = block.getUniqueName(`${this.var}_resize_listener`);
					block.addVariable(resize_listener);

					block.builders.mount.addLine(
						`${resize_listener} = @addResizeListener(${this.var}, ${callee});`
					);

					block.builders.destroy.addLine(
						`${resize_listener}.cancel();`
					);
				} else {
					block.event_listeners.push(
						`@addListener(${this.var}, "${name}", ${callee})`
					);
				}
			});

			const someInitialStateIsUndefined = group.bindings
				.map(binding => `${binding.snippet} === void 0`)
				.join(' || ');

			if (this.node.name === 'select' || group.bindings.find(binding => binding.name === 'indeterminate' || binding.isReadOnlyMediaAttribute)) {
				block.builders.hydrate.addLine(
					`if (${someInitialStateIsUndefined}) @add_render_callback(() => ${callee}.call(${this.var}));`
				);
			}

			if (group.events[0] === 'resize') {
				block.builders.hydrate.addLine(
					`@add_render_callback(() => ${callee}.call(${this.var}));`
				);
			}
		});

		this.initialUpdate = mungedBindings.map(binding => binding.initialUpdate).filter(Boolean).join('\n');

		const this_binding = this.bindings.find(b => b.node.name === 'this');
		if (this_binding) {
			const name = renderer.component.getUniqueName(`${this.var}_binding`);
			renderer.component.declarations.push(name);
			renderer.component.template_references.add(name);

			const { handler, object } = this_binding.munge(block);

			renderer.component.partly_hoisted.push(deindent`
				function ${name}($$node) {
					${handler.mutation}
					$$invalidate('${object}', ${object});
				}
			`);

			block.builders.mount.addLine(`@add_binding_callback(() => ctx.${name}(${this.var}));`);
			block.builders.destroy.addLine(`ctx.${name}(null);`);
		}
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
					const snippet = attr.expression.render();

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
		addEventHandlers(block, this.var, this.node.handlers);
	}

	addTransitions(
		block: Block
	) {
		const { intro, outro } = this.node;
		if (!intro && !outro) return;

		const { component } = this.renderer;

		if (intro === outro) {
			const name = block.getUniqueName(`${this.var}_transition`);
			const snippet = intro.expression
				? intro.expression.render()
				: '{}';

			block.addVariable(name);

			const fn = component.qualify(intro.name);

			block.builders.intro.addConditional(`@intros.enabled`, deindent`
				if (${name}) ${name}.invalidate();

				@add_render_callback(() => {
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
					? intro.expression.render()
					: '{}';

				const fn = component.qualify(intro.name); // TODO add built-in transitions?

				if (outro) {
					block.builders.intro.addBlock(deindent`
						if (${introName}) ${introName}.abort(1);
						if (${outroName}) ${outroName}.abort(1);
					`);
				}

				block.builders.intro.addConditional(`@intros.enabled`, deindent`
					@add_render_callback(() => {
						${introName} = @wrapTransition(#component, ${this.var}, ${fn}, ${snippet}, true);
						${introName}.run(1);
					});
				`);
			}

			if (outro) {
				block.addVariable(outroName);
				const snippet = outro.expression
					? outro.expression.render()
					: '{}';

				const fn = component.qualify(outro.name);

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

		const { component } = this.renderer;

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

		const params = this.node.animation.expression ? this.node.animation.expression.render() : '{}';

		let { name } = this.node.animation;
		if (!component.hoistable_names.has(name) && !component.imported_declarations.has(name)) {
			name = `ctx.${name}`;
		}

		block.builders.animate.addBlock(deindent`
			if (${animation}) ${animation}.stop();
			${animation} = @wrapAnimation(${this.var}, ${rect}, ${name}, ${params});
		`);
	}

	addActions(block: Block) {
		addActions(this.renderer.component, block, this.var, this.node.actions);
	}

	addClasses(block: Block) {
		this.node.classes.forEach(classDir => {
			const { expression, name } = classDir;
			let snippet, dependencies;
			if (expression) {
				snippet = expression.render();
				dependencies = expression.dependencies;
			} else {
				snippet = `${quotePropIfNecessary(name)}`;
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
		const slot = this.attributes.find(attribute => attribute.node.name === 'slot');
		if (slot) {
			const prop = quotePropIfNecessary(slot.node.chunks[0].data);
			return `@append(${name}.$$.slotted${prop}, ${this.var});`;
		}

		return `@append(${name}.$$.slotted.default, ${this.var});`;
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