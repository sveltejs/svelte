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
import createDebuggingComment from '../../../../utils/createDebuggingComment';
import sanitize from '../../../../utils/sanitize';
import { get_context_merger } from '../shared/get_context_merger';

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

	slot_block: Block;
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
					const name = attribute.getStaticValue();

					if (!(owner as InlineComponentWrapper).slots.has(name)) {
						const child_block = block.child({
							comment: createDebuggingComment(node, this.renderer.component),
							name: this.renderer.component.getUniqueName(`create_${sanitize(name)}_slot`)
						});

						const fn = get_context_merger(this.node.lets);

						(owner as InlineComponentWrapper).slots.set(name, {
							block: child_block,
							scope: this.node.scope,
							fn
						});
						this.renderer.blocks.push(child_block);
					}

					this.slot_block = (owner as InlineComponentWrapper).slots.get(name).block;
					block = this.slot_block;
				}
			}
			if (attribute.name === 'style') {
				return new StyleAttributeWrapper(this, block, attribute);
			}
			return new AttributeWrapper(this, block, attribute);
		});

		// ordinarily, there'll only be one... but we need to handle
		// the rare case where an element can have multiple bindings,
		// e.g. <audio bind:paused bind:currentTime>
		this.bindings = this.node.bindings.map(binding => new Binding(block, binding, this));

		if (node.intro || node.outro) {
			if (node.intro) block.addIntro(node.intro.is_local);
			if (node.outro) block.addOutro(node.outro.is_local);
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
			if (handler.expression) {
				block.addDependencies(handler.expression.dependencies);
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

		if (this.slot_block) {
			block.parent.addDependencies(block.dependencies);

			// appalling hack
			const index = block.parent.wrappers.indexOf(this);
			block.parent.wrappers.splice(index, 1);
			block.wrappers.push(this);
		}
	}

	render(block: Block, parentNode: string, parentNodes: string) {
		const { renderer } = this;

		if (this.node.name === 'slot') {
			const slotName = this.getStaticAttributeValue('name') || 'default';
			renderer.slots.add(slotName);
		}

		if (this.node.name === 'noscript') return;

		if (this.slot_block) {
			block = this.slot_block;
		}

		const node = this.var;
		const nodes = parentNodes && block.getUniqueName(`${this.var}_nodes`) // if we're in unclaimable territory, i.e. <head>, parentNodes is null

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

		if (parentNode) {
			block.builders.mount.addLine(
				`@append(${parentNode}, ${node});`
			);

			if (parentNode === 'document.head') {
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

		const eventHandlerOrBindingUsesContext = (
			this.bindings.some(binding => binding.handler.usesContext) ||
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

			(wrapper as ElementWrapper).attributes.forEach((attr: AttributeWrapper) => {
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

		const lock = this.bindings.some(binding => binding.needsLock) ?
			block.getUniqueName(`${this.var}_updating`) :
			null;

		if (lock) block.addVariable(lock, 'false');

		const groups = events
			.map(event => ({
				events: event.eventNames,
				bindings: this.bindings
					.filter(binding => binding.node.name !== 'this')
					.filter(binding => event.filter(this.node, binding.node.name))
			}))
			.filter(group => group.bindings.length);

		groups.forEach(group => {
			const handler = renderer.component.getUniqueName(`${this.var}_${group.events.join('_')}_handler`);

			renderer.component.add_var({
				name: handler,
				internal: true,
				referenced: true
			});

			// TODO figure out how to handle locks
			const needsLock = group.bindings.some(binding => binding.needsLock);

			const dependencies = new Set();
			const contextual_dependencies = new Set();

			group.bindings.forEach(binding => {
				// TODO this is a mess
				addToSet(dependencies, binding.get_dependencies());
				addToSet(contextual_dependencies, binding.node.expression.contextual_dependencies);
				addToSet(contextual_dependencies, binding.handler.contextual_dependencies);

				binding.render(block, lock);
			});

			// media bindings — awkward special case. The native timeupdate events
			// fire too infrequently, so we need to take matters into our
			// own hands
			let animation_frame;
			if (group.events[0] === 'timeupdate') {
				animation_frame = block.getUniqueName(`${this.var}_animationframe`);
				block.addVariable(animation_frame);
			}

			const has_local_function = contextual_dependencies.size > 0 || needsLock || animation_frame;

			let callee;

			// TODO dry this out — similar code for event handlers and component bindings
			if (has_local_function) {
				// need to create a block-local function that calls an instance-level function
				block.builders.init.addBlock(deindent`
					function ${handler}() {
						${animation_frame && deindent`
						cancelAnimationFrame(${animation_frame});
						if (!${this.var}.paused) ${animation_frame} = requestAnimationFrame(${handler});`}
						${needsLock && `${lock} = true;`}
						ctx.${handler}.call(${this.var}${contextual_dependencies.size > 0 ? ', ctx' : ''});
					}
				`);

				callee = handler;
			} else {
				callee = `ctx.${handler}`;
			}

			this.renderer.component.partly_hoisted.push(deindent`
				function ${handler}(${contextual_dependencies.size > 0 ? `{ ${Array.from(contextual_dependencies).join(', ')} }` : ``}) {
					${group.bindings.map(b => b.handler.mutation)}
					${Array.from(dependencies).filter(dep => dep[0] !== '$').map(dep => `${this.renderer.component.invalidate(dep)};`)}
				}
			`);

			group.events.forEach(name => {
				if (name === 'resize') {
					// special case
					const resize_listener = block.getUniqueName(`${this.var}_resize_listener`);
					block.addVariable(resize_listener);

					block.builders.mount.addLine(
						`${resize_listener} = @addResizeListener(${this.var}, ${callee}.bind(${this.var}));`
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

			if (this.node.name === 'select' || group.bindings.find(binding => binding.node.name === 'indeterminate' || binding.isReadOnlyMediaAttribute())) {
				const callback = has_local_function ? handler : `() => ${callee}.call(${this.var})`;
				block.builders.hydrate.addLine(
					`if (${someInitialStateIsUndefined}) @add_render_callback(${callback});`
				);
			}

			if (group.events[0] === 'resize') {
				block.builders.hydrate.addLine(
					`@add_render_callback(() => ${callee}.call(${this.var}));`
				);
			}
		});

		if (lock) {
			block.builders.update.addLine(`${lock} = false;`);
		}

		const this_binding = this.bindings.find(b => b.node.name === 'this');
		if (this_binding) {
			const name = renderer.component.getUniqueName(`${this.var}_binding`);

			renderer.component.add_var({
				name,
				internal: true,
				referenced: true
			});

			const { handler, object } = this_binding;

			const args = [];
			for (const arg of handler.contextual_dependencies) {
				args.push(arg);
				block.addVariable(arg, `ctx.${arg}`);
			}

			renderer.component.partly_hoisted.push(deindent`
				function ${name}(${['$$node', 'check'].concat(args).join(', ')}) {
					${handler.snippet ? `if ($$node || (!$$node && ${handler.snippet} === check)) ` : ''}${handler.mutation}
					${renderer.component.invalidate(object)};
				}
			`);

			block.builders.mount.addLine(`@add_binding_callback(() => ctx.${name}(${[this.var, 'null'].concat(args).join(', ')}));`);
			block.builders.destroy.addLine(`ctx.${name}(${['null', this.var].concat(args).join(', ')});`);
			block.builders.update.addLine(deindent`
				if (changed.items) {
					ctx.${name}(${['null', this.var].concat(args).join(', ')});
					${args.map(a => `${a} = ctx.${a}`).join(', ')};
					ctx.${name}(${[this.var, 'null'].concat(args).join(', ')});
				}`
			);
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
					const snippet = attr.expression.render(block);

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
			// bidirectional transition
			const name = block.getUniqueName(`${this.var}_transition`);
			const snippet = intro.expression
				? intro.expression.render(block)
				: '{}';

			block.addVariable(name);

			const fn = component.qualify(intro.name);

			const intro_block = deindent`
				@add_render_callback(() => {
					if (!${name}) ${name} = @create_bidirectional_transition(${this.var}, ${fn}, ${snippet}, true);
					${name}.run(1);
				});
			`;

			const outro_block = deindent`
				if (!${name}) ${name} = @create_bidirectional_transition(${this.var}, ${fn}, ${snippet}, false);
				${name}.run(0);
			`;

			if (intro.is_local) {
				block.builders.intro.addBlock(deindent`
					if (#local) {
						${intro_block}
					}
				`);

				block.builders.outro.addBlock(deindent`
					if (#local) {
						${outro_block}
					}
				`);
			} else {
				block.builders.intro.addBlock(intro_block);
				block.builders.outro.addBlock(outro_block);
			}

			block.builders.destroy.addConditional('detach', `if (${name}) ${name}.end();`);
		}

		else {
			const introName = intro && block.getUniqueName(`${this.var}_intro`);
			const outroName = outro && block.getUniqueName(`${this.var}_outro`);

			if (intro) {
				block.addVariable(introName);
				const snippet = intro.expression
					? intro.expression.render(block)
					: '{}';

				const fn = component.qualify(intro.name);

				let intro_block;

				if (outro) {
					intro_block = deindent`
						@add_render_callback(() => {
							if (${outroName}) ${outroName}.end(1);
							if (!${introName}) ${introName} = @create_in_transition(${this.var}, ${fn}, ${snippet});
							${introName}.start();
						});
					`;

					block.builders.outro.addLine(`if (${introName}) ${introName}.invalidate();`);
				} else {
					intro_block = deindent`
						if (!${introName}) {
							@add_render_callback(() => {
								${introName} = @create_in_transition(${this.var}, ${fn}, ${snippet});
								${introName}.start();
							});
						}
					`;
				}

				if (intro.is_local) {
					intro_block = deindent`
						if (#local) {
							${intro_block}
						}
					`;
				}

				block.builders.intro.addBlock(intro_block);
			}

			if (outro) {
				block.addVariable(outroName);
				const snippet = outro.expression
					? outro.expression.render(block)
					: '{}';

				const fn = component.qualify(outro.name);

				if (!intro) {
					block.builders.intro.addBlock(deindent`
						if (${outroName}) ${outroName}.end(1);
					`);
				}

				// TODO hide elements that have outro'd (unless they belong to a still-outroing
				// group) prior to their removal from the DOM
				let outro_block = deindent`
					${outroName} = @create_out_transition(${this.var}, ${fn}, ${snippet});
				`;

				if (outro_block) {
					outro_block = deindent`
						if (#local) {
							${outro_block}
						}
					`;
				}

				block.builders.outro.addBlock(outro_block);

				block.builders.destroy.addConditional('detach', `if (${outroName}) ${outroName}.end();`);
			}
		}
	}

	addAnimation(block: Block) {
		if (!this.node.animation) return;

		const { component } = this.renderer;

		const rect = block.getUniqueName('rect');
		const stop_animation = block.getUniqueName('stop_animation');

		block.addVariable(rect);
		block.addVariable(stop_animation, '@noop');

		block.builders.measure.addBlock(deindent`
			${rect} = ${this.var}.getBoundingClientRect();
		`);

		block.builders.fix.addBlock(deindent`
			@fix_position(${this.var});
			${stop_animation}();
		`);

		const params = this.node.animation.expression ? this.node.animation.expression.render(block) : '{}';

		const name = component.qualify(this.node.animation.name);

		block.builders.animate.addBlock(deindent`
			${stop_animation}();
			${stop_animation} = @animate(${this.var}, ${rect}, ${name}, ${params});
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
				snippet = expression.render(block);
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

	addCssClass(className = this.component.stylesheet.id) {
		const classAttribute = this.attributes.find(a => a.name === 'class');
		if (classAttribute && !classAttribute.isTrue) {
			if (classAttribute.chunks.length === 1 && classAttribute.chunks[0].type === 'Text') {
				(classAttribute.chunks[0] as Text).data += ` ${className}`;
			} else {
				(classAttribute.chunks as Node[]).push(
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