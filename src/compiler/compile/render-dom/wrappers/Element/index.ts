import Renderer from '../../Renderer';
import Element from '../../../nodes/Element';
import Wrapper from '../shared/Wrapper';
import Block from '../../Block';
import { is_void, quote_prop_if_necessary, quote_name_if_necessary, sanitize } from '../../../../utils/names';
import FragmentWrapper from '../Fragment';
import { stringify, escape_html, escape } from '../../../utils/stringify';
import TextWrapper from '../Text';
import fix_attribute_casing from './fix_attribute_casing';
import deindent from '../../../utils/deindent';
import { namespaces } from '../../../../utils/namespaces';
import AttributeWrapper from './Attribute';
import StyleAttributeWrapper from './StyleAttribute';
import { dimensions } from '../../../../utils/patterns';
import Binding from './Binding';
import InlineComponentWrapper from '../InlineComponent';
import add_to_set from '../../../utils/add_to_set';
import add_event_handlers from '../shared/add_event_handlers';
import add_actions from '../shared/add_actions';
import create_debugging_comment from '../shared/create_debugging_comment';
import { get_context_merger } from '../shared/get_context_merger';

const events = [
	{
		event_names: ['input'],
		filter: (node: Element, _name: string) =>
			node.name === 'textarea' ||
			node.name === 'input' && !/radio|checkbox|range/.test(node.get_static_attribute_value('type') as string)
	},
	{
		event_names: ['input'],
		filter: (node: Element, name: string) =>
			(name === 'text' || name === 'html') &&
			node.attributes.some(attribute => attribute.name === 'contenteditable')
	},
	{
		event_names: ['change'],
		filter: (node: Element, _name: string) =>
			node.name === 'select' ||
			node.name === 'input' && /radio|checkbox/.test(node.get_static_attribute_value('type') as string)
	},
	{
		event_names: ['change', 'input'],
		filter: (node: Element, _name: string) =>
			node.name === 'input' && node.get_static_attribute_value('type') === 'range'
	},

	{
		event_names: ['resize'],
		filter: (_node: Element, name: string) =>
			dimensions.test(name)
	},

	// media events
	{
		event_names: ['timeupdate'],
		filter: (node: Element, name: string) =>
			node.is_media_node() &&
			(name === 'currentTime' || name === 'played')
	},
	{
		event_names: ['durationchange'],
		filter: (node: Element, name: string) =>
			node.is_media_node() &&
			name === 'duration'
	},
	{
		event_names: ['play', 'pause'],
		filter: (node: Element, name: string) =>
			node.is_media_node() &&
			name === 'paused'
	},
	{
		event_names: ['progress'],
		filter: (node: Element, name: string) =>
			node.is_media_node() &&
			name === 'buffered'
	},
	{
		event_names: ['loadedmetadata'],
		filter: (node: Element, name: string) =>
			node.is_media_node() &&
			(name === 'buffered' || name === 'seekable')
	},
	{
		event_names: ['volumechange'],
		filter: (node: Element, name: string) =>
			node.is_media_node() &&
			name === 'volume'
	},
	{
		event_names: ['ratechange'],
		filter: (node: Element, name: string) =>
			node.is_media_node() &&
			name === 'playbackRate'
	},

	// details event
	{
		event_names: ['toggle'],
		filter: (node: Element, _name: string) =>
			node.name === 'details'
	},
];

export default class ElementWrapper extends Wrapper {
	node: Element;
	fragment: FragmentWrapper;
	attributes: AttributeWrapper[];
	bindings: Binding[];
	class_dependencies: string[];

	slot_block: Block;
	select_binding_dependencies?: Set<string>;

	var: string;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: Element,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);
		this.var = node.name.replace(/[^a-zA-Z0-9_$]/g, '_');

		this.class_dependencies = [];

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
					const name = attribute.get_static_value() as string;

					if (!(owner as InlineComponentWrapper).slots.has(name)) {
						const child_block = block.child({
							comment: create_debugging_comment(node, this.renderer.component),
							name: this.renderer.component.get_unique_name(`create_${sanitize(name)}_slot`)
						});

						const lets = this.node.lets;
						const seen = new Set(lets.map(l => l.name));

						(owner as InlineComponentWrapper).node.lets.forEach(l => {
							if (!seen.has(l.name)) lets.push(l);
						});

						const fn = get_context_merger(lets);

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
			if (node.intro) block.add_intro(node.intro.is_local);
			if (node.outro) block.add_outro(node.outro.is_local);
		}

		if (node.animation) {
			block.add_animation();
		}

		// add directive and handler dependencies
		[node.animation, node.outro, ...node.actions, ...node.classes].forEach(directive => {
			if (directive && directive.expression) {
				block.add_dependencies(directive.expression.dependencies);
			}
		});

		node.handlers.forEach(handler => {
			if (handler.expression) {
				block.add_dependencies(handler.expression.dependencies);
			}
		});

		if (this.parent) {
			if (node.actions.length > 0) this.parent.cannot_use_innerhtml();
			if (node.animation) this.parent.cannot_use_innerhtml();
			if (node.bindings.length > 0) this.parent.cannot_use_innerhtml();
			if (node.classes.length > 0) this.parent.cannot_use_innerhtml();
			if (node.intro || node.outro) this.parent.cannot_use_innerhtml();
			if (node.handlers.length > 0) this.parent.cannot_use_innerhtml();

			if (this.node.name === 'option') this.parent.cannot_use_innerhtml();

			if (renderer.options.dev) {
				this.parent.cannot_use_innerhtml(); // need to use add_location
			}
		}

		this.fragment = new FragmentWrapper(renderer, block, node.children, this, strip_whitespace, next_sibling);

		if (this.slot_block) {
			block.parent.add_dependencies(block.dependencies);

			// appalling hack
			const index = block.parent.wrappers.indexOf(this);
			block.parent.wrappers.splice(index, 1);
			block.wrappers.push(this);
		}
	}

	render(block: Block, parent_node: string, parent_nodes: string) {
		const { renderer } = this;

		if (this.node.name === 'noscript') return;

		if (this.slot_block) {
			block = this.slot_block;
		}

		const node = this.var;
		const nodes = parent_nodes && block.get_unique_name(`${this.var}_nodes`); // if we're in unclaimable territory, i.e. <head>, parent_nodes is null

		block.add_variable(node);
		const render_statement = this.get_render_statement();
		block.builders.create.add_line(
			`${node} = ${render_statement};`
		);

		if (renderer.options.hydratable) {
			if (parent_nodes) {
				block.builders.claim.add_block(deindent`
					${node} = ${this.get_claim_statement(parent_nodes)};
					var ${nodes} = @children(${this.node.name === 'template' ? `${node}.content` : node});
				`);
			} else {
				block.builders.claim.add_line(
					`${node} = ${render_statement};`
				);
			}
		}

		if (parent_node) {
			block.builders.mount.add_line(
				`@append(${parent_node}, ${node});`
			);

			if (parent_node === 'document.head') {
				block.builders.destroy.add_line(`@detach(${node});`);
			}
		} else {
			block.builders.mount.add_line(`@insert(#target, ${node}, anchor);`);

			// TODO we eventually need to consider what happens to elements
			// that belong to the same outgroup as an outroing element...
			block.builders.destroy.add_conditional('detaching', `@detach(${node});`);
		}

		// insert static children with textContent or innerHTML
		if (!this.node.namespace && this.can_use_innerhtml && this.fragment.nodes.length > 0) {
			if (this.fragment.nodes.length === 1 && this.fragment.nodes[0].node.type === 'Text') {
				block.builders.create.add_line(
					 // @ts-ignore todo: should it be this.fragment.nodes[0].node.data instead?
					`${node}.textContent = ${stringify(this.fragment.nodes[0].data)};`
				);
			} else {
				const inner_html = escape(
					this.fragment.nodes
						.map(to_html)
						.join('')
				);

				block.builders.create.add_line(
					`${node}.innerHTML = \`${inner_html}\`;`
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

		const event_handler_or_binding_uses_context = (
			this.bindings.some(binding => binding.handler.uses_context) ||
			this.node.handlers.some(handler => handler.uses_context) ||
			this.node.actions.some(action => action.uses_context)
		);

		if (event_handler_or_binding_uses_context) {
			block.maintain_context = true;
		}

		this.add_bindings(block);
		this.add_event_handlers(block);
		this.add_attributes(block);
		this.add_transitions(block);
		this.add_animation(block);
		this.add_actions(block);
		this.add_classes(block);

		if (nodes && this.renderer.options.hydratable) {
			block.builders.claim.add_line(
				`${nodes}.forEach(@detach);`
			);
		}

		function to_html(wrapper: ElementWrapper | TextWrapper) {
			if (wrapper.node.type === 'Text') {
				if (wrapper.node.use_space) return ' ';

				const parent = wrapper.node.parent as Element;

				const raw = parent && (
					parent.name === 'script' ||
					parent.name === 'style'
				);

				return (raw
					? wrapper.node.data
					: escape_html(wrapper.node.data))
						.replace(/\\/g, '\\\\')
						.replace(/`/g, '\\`')
						.replace(/\$/g, '\\$');
			}

			if (wrapper.node.name === 'noscript') return '';

			let open = `<${wrapper.node.name}`;

			(wrapper as ElementWrapper).attributes.forEach((attr: AttributeWrapper) => {
				open += ` ${fix_attribute_casing(attr.node.name)}${attr.stringify()}`;
			});

			if (is_void(wrapper.node.name)) return open + '>';

			return `${open}>${(wrapper as ElementWrapper).fragment.nodes.map(to_html).join('')}</${wrapper.node.name}>`;
		}

		if (renderer.options.dev) {
			const loc = renderer.locate(this.node.start);
			block.builders.hydrate.add_line(
				`@add_location(${this.var}, ${renderer.file_var}, ${loc.line}, ${loc.column}, ${this.node.start});`
			);
		}
	}

	get_render_statement() {
		const { name, namespace } = this.node;

		if (namespace === 'http://www.w3.org/2000/svg') {
			return `@svg_element("${name}")`;
		}

		if (namespace) {
			return `document.createElementNS("${namespace}", "${name}")`;
		}

		return `@element("${name}")`;
	}

	get_claim_statement(nodes: string) {
		const attributes = this.node.attributes
			.filter((attr) => attr.type === 'Attribute')
			.map((attr) => `${quote_name_if_necessary(attr.name)}: true`)
			.join(', ');

		const name = this.node.namespace
			? this.node.name
			: this.node.name.toUpperCase();

		return `@claim_element(${nodes}, "${name}", ${attributes
			? `{ ${attributes} }`
			: `{}`}, ${this.node.namespace === namespaces.svg ? true : false})`;
	}

	add_bindings(block: Block) {
		const { renderer } = this;

		if (this.bindings.length === 0) return;

		renderer.component.has_reactive_assignments = true;

		const lock = this.bindings.some(binding => binding.needs_lock) ?
			block.get_unique_name(`${this.var}_updating`) :
			null;

		if (lock) block.add_variable(lock, 'false');

		const groups = events
			.map(event => ({
				events: event.event_names,
				bindings: this.bindings
					.filter(binding => binding.node.name !== 'this')
					.filter(binding => event.filter(this.node, binding.node.name))
			}))
			.filter(group => group.bindings.length);

		groups.forEach(group => {
			const handler = renderer.component.get_unique_name(`${this.var}_${group.events.join('_')}_handler`);

			renderer.component.add_var({
				name: handler,
				internal: true,
				referenced: true
			});

			// TODO figure out how to handle locks
			const needs_lock = group.bindings.some(binding => binding.needs_lock);

			const dependencies = new Set();
			const contextual_dependencies = new Set();

			group.bindings.forEach(binding => {
				// TODO this is a mess
				add_to_set(dependencies, binding.get_dependencies());
				add_to_set(contextual_dependencies, binding.node.expression.contextual_dependencies);
				add_to_set(contextual_dependencies, binding.handler.contextual_dependencies);

				binding.render(block, lock);
			});

			// media bindings — awkward special case. The native timeupdate events
			// fire too infrequently, so we need to take matters into our
			// own hands
			let animation_frame;
			if (group.events[0] === 'timeupdate') {
				animation_frame = block.get_unique_name(`${this.var}_animationframe`);
				block.add_variable(animation_frame);
			}

			const has_local_function = contextual_dependencies.size > 0 || needs_lock || animation_frame;

			let callee;

			// TODO dry this out — similar code for event handlers and component bindings
			if (has_local_function) {
				// need to create a block-local function that calls an instance-level function
				block.builders.init.add_block(deindent`
					function ${handler}() {
						${animation_frame && deindent`
						cancelAnimationFrame(${animation_frame});
						if (!${this.var}.paused) ${animation_frame} = @raf(${handler});`}
						${needs_lock && `${lock} = true;`}
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
					const resize_listener = block.get_unique_name(`${this.var}_resize_listener`);
					block.add_variable(resize_listener);

					block.builders.mount.add_line(
						`${resize_listener} = @add_resize_listener(${this.var}, ${callee}.bind(${this.var}));`
					);

					block.builders.destroy.add_line(
						`${resize_listener}.cancel();`
					);
				} else {
					block.event_listeners.push(
						`@listen(${this.var}, "${name}", ${callee})`
					);
				}
			});

			const some_initial_state_is_undefined = group.bindings
				.map(binding => `${binding.snippet} === void 0`)
				.join(' || ');

			const should_initialise = (
				this.node.name === 'select' ||
				group.bindings.find(binding => {
					return (
						binding.node.name === 'indeterminate' ||
						binding.node.name === 'text' ||
						binding.node.name === 'html' ||
						binding.is_readonly_media_attribute()
					);
				})
			);

			if (should_initialise) {
				const callback = has_local_function ? handler : `() => ${callee}.call(${this.var})`;
				block.builders.hydrate.add_line(
					`if (${some_initial_state_is_undefined}) @add_render_callback(${callback});`
				);
			}

			if (group.events[0] === 'resize') {
				block.builders.hydrate.add_line(
					`@add_render_callback(() => ${callee}.call(${this.var}));`
				);
			}
		});

		if (lock) {
			block.builders.update.add_line(`${lock} = false;`);
		}

		const this_binding = this.bindings.find(b => b.node.name === 'this');
		if (this_binding) {
			const name = renderer.component.get_unique_name(`${this.var}_binding`);

			renderer.component.add_var({
				name,
				internal: true,
				referenced: true
			});

			const { handler, object } = this_binding;

			const args = [];
			for (const arg of handler.contextual_dependencies) {
				args.push(arg);
				block.add_variable(arg, `ctx.${arg}`);
			}

			renderer.component.partly_hoisted.push(deindent`
				function ${name}(${['$$node', 'check'].concat(args).join(', ')}) {
					${handler.snippet ? `if ($$node || (!$$node && ${handler.snippet} === check)) ` : ''}${handler.mutation}
					${renderer.component.invalidate(object)};
				}
			`);

			block.builders.mount.add_line(`@add_binding_callback(() => ctx.${name}(${[this.var, 'null'].concat(args).join(', ')}));`);
			block.builders.destroy.add_line(`ctx.${name}(${['null', this.var].concat(args).join(', ')});`);
			block.builders.update.add_line(deindent`
				if (changed.items) {
					ctx.${name}(${['null', this.var].concat(args).join(', ')});
					${args.map(a => `${a} = ctx.${a}`).join(', ')};
					ctx.${name}(${[this.var, 'null'].concat(args).join(', ')});
				}`
			);
		}
	}

	add_attributes(block: Block) {
		// @ts-ignore todo:
		if (this.node.attributes.find(attr => attr.type === 'Spread')) {
			this.add_spread_attributes(block);
			return;
		}

		this.attributes.forEach((attribute) => {
			if (attribute.node.name === 'class' && attribute.node.is_dynamic) {
				this.class_dependencies.push(...attribute.node.dependencies);
			}
			attribute.render(block);
		});
	}

	add_spread_attributes(block: Block) {
		const levels = block.get_unique_name(`${this.var}_levels`);
		const data = block.get_unique_name(`${this.var}_data`);

		const initial_props = [];
		const updates = [];

		this.node.attributes
			.filter(attr => attr.type === 'Attribute' || attr.type === 'Spread')
			.forEach(attr => {
				const condition = attr.dependencies.size > 0
					? `(${[...attr.dependencies].map(d => `changed.${d}`).join(' || ')})`
					: null;

				if (attr.is_spread) {
					const snippet = attr.expression.render(block);

					initial_props.push(snippet);

					updates.push(condition ? `${condition} && ${snippet}` : snippet);
				} else {
					const snippet = `{ ${quote_name_if_necessary(attr.name)}: ${attr.get_value(block)} }`;
					initial_props.push(snippet);

					updates.push(condition ? `${condition} && ${snippet}` : snippet);
				}
			});

		block.builders.init.add_block(deindent`
			var ${levels} = [
				${initial_props.join(',\n')}
			];

			var ${data} = {};
			for (var #i = 0; #i < ${levels}.length; #i += 1) {
				${data} = @assign(${data}, ${levels}[#i]);
			}
		`);

		block.builders.hydrate.add_line(
			`@set_attributes(${this.var}, ${data});`
		);

		block.builders.update.add_block(deindent`
			@set_attributes(${this.var}, @get_spread_update(${levels}, [
				${updates.join(',\n')}
			]));
		`);
	}

	add_event_handlers(block: Block) {
		add_event_handlers(block, this.var, this.node.handlers);
	}

	add_transitions(
		block: Block
	) {
		const { intro, outro } = this.node;
		if (!intro && !outro) return;

		const { component } = this.renderer;

		if (intro === outro) {
			// bidirectional transition
			const name = block.get_unique_name(`${this.var}_transition`);
			const snippet = intro.expression
				? intro.expression.render(block)
				: '{}';

			block.add_variable(name);

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
				block.builders.intro.add_block(deindent`
					if (#local) {
						${intro_block}
					}
				`);

				block.builders.outro.add_block(deindent`
					if (#local) {
						${outro_block}
					}
				`);
			} else {
				block.builders.intro.add_block(intro_block);
				block.builders.outro.add_block(outro_block);
			}

			block.builders.destroy.add_conditional('detaching', `if (${name}) ${name}.end();`);
		}

		else {
			const intro_name = intro && block.get_unique_name(`${this.var}_intro`);
			const outro_name = outro && block.get_unique_name(`${this.var}_outro`);

			if (intro) {
				block.add_variable(intro_name);
				const snippet = intro.expression
					? intro.expression.render(block)
					: '{}';

				const fn = component.qualify(intro.name);

				let intro_block;

				if (outro) {
					intro_block = deindent`
						@add_render_callback(() => {
							if (${outro_name}) ${outro_name}.end(1);
							if (!${intro_name}) ${intro_name} = @create_in_transition(${this.var}, ${fn}, ${snippet});
							${intro_name}.start();
						});
					`;

					block.builders.outro.add_line(`if (${intro_name}) ${intro_name}.invalidate();`);
				} else {
					intro_block = deindent`
						if (!${intro_name}) {
							@add_render_callback(() => {
								${intro_name} = @create_in_transition(${this.var}, ${fn}, ${snippet});
								${intro_name}.start();
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

				block.builders.intro.add_block(intro_block);
			}

			if (outro) {
				block.add_variable(outro_name);
				const snippet = outro.expression
					? outro.expression.render(block)
					: '{}';

				const fn = component.qualify(outro.name);

				if (!intro) {
					block.builders.intro.add_block(deindent`
						if (${outro_name}) ${outro_name}.end(1);
					`);
				}

				// TODO hide elements that have outro'd (unless they belong to a still-outroing
				// group) prior to their removal from the DOM
				let outro_block = deindent`
					${outro_name} = @create_out_transition(${this.var}, ${fn}, ${snippet});
				`;

				if (outro.is_local) {
					outro_block = deindent`
						if (#local) {
							${outro_block}
						}
					`;
				}

				block.builders.outro.add_block(outro_block);

				block.builders.destroy.add_conditional('detaching', `if (${outro_name}) ${outro_name}.end();`);
			}
		}
	}

	add_animation(block: Block) {
		if (!this.node.animation) return;

		const { component } = this.renderer;
		const { outro } = this.node;

		const rect = block.get_unique_name('rect');
		const stop_animation = block.get_unique_name('stop_animation');

		block.add_variable(rect);
		block.add_variable(stop_animation, '@noop');

		block.builders.measure.add_block(deindent`
			${rect} = ${this.var}.getBoundingClientRect();
		`);

		block.builders.fix.add_block(deindent`
			@fix_position(${this.var});
			${stop_animation}();
			${outro && `@add_transform(${this.var}, ${rect});`}
		`);

		const params = this.node.animation.expression ? this.node.animation.expression.render(block) : '{}';

		const name = component.qualify(this.node.animation.name);

		block.builders.animate.add_block(deindent`
			${stop_animation}();
			${stop_animation} = @create_animation(${this.var}, ${rect}, ${name}, ${params});
		`);
	}

	add_actions(block: Block) {
		add_actions(this.renderer.component, block, this.var, this.node.actions);
	}

	add_classes(block: Block) {
		this.node.classes.forEach(class_directive => {
			const { expression, name } = class_directive;
			let snippet;
			let dependencies;
			if (expression) {
				snippet = expression.render(block);
				dependencies = expression.dependencies;
			} else {
				snippet = `${quote_prop_if_necessary(name)}`;
				dependencies = new Set([name]);
			}
			const updater = `@toggle_class(${this.var}, "${name}", ${snippet});`;

			block.builders.hydrate.add_line(updater);

			if ((dependencies && dependencies.size > 0) || this.class_dependencies.length) {
				const all_dependencies = this.class_dependencies.concat(...dependencies);
				const deps = all_dependencies.map(dependency => `changed${quote_prop_if_necessary(dependency)}`).join(' || ');
				const condition = all_dependencies.length > 1 ? `(${deps})` : deps;

				block.builders.update.add_conditional(
					condition,
					updater
				);
			}
		});
	}

	// todo: looks to be dead code copypasted from Element.add_css_class in src/compile/nodes/Element.ts
	// add_css_class(class_name = this.component.stylesheet.id) {
	// 	const class_attribute = this.attributes.find(a => a.name === 'class');
	// 	if (class_attribute && !class_attribute.is_true) {
	// 		if (class_attribute.chunks.length === 1 && class_attribute.chunks[0].type === 'Text') {
	// 			(class_attribute.chunks[0] as Text).data += ` ${class_name}`;
	// 		} else {
	// 			(class_attribute.chunks as Node[]).push(
	// 				new Text(this.component, this, this.scope, {
	// 					type: 'Text',
	// 					data: ` ${class_name}`
	// 				})
	// 			);
	// 		}
	// 	} else {
	// 		this.attributes.push(
	// 			new Attribute(this.component, this, this.scope, {
	// 				type: 'Attribute',
	// 				name: 'class',
	// 				value: [{ type: 'Text', data: class_name }]
	// 			})
	// 		);
	// 	}
	// }
}
