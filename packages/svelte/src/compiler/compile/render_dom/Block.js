import { b, x } from 'code-red';
import { is_head } from './wrappers/shared/is_head.js';
import { regex_double_quotes } from '../../utils/patterns.js';
import { flatten } from '../../utils/flatten.js';

export default class Block {
	/**
	 * @typedef {Object} Bindings
	 * @property {import('estree').Identifier} object
	 * @property {import('estree').Identifier} property
	 * @property {import('estree').Node} snippet
	 * @property {string} store
	 * @property {(node:import('estree').Node) => import('estree').Node} modifier
	 */
	/**
	 * @typedef {Object} BlockOptions
	 * @property {Block} [parent]
	 * @property {import('estree').Identifier} name
	 * @property {string} type
	 * @property {import('./Renderer.js').default} [renderer]
	 * @property {string} [comment]
	 * @property {import('estree').Identifier} [key]
	 * @property {Map<string,Bindings>} [bindings]
	 * @property {Set<string>} [dependencies]
	 */

	/** @type {Block} */
	parent;

	/** @type {import('./Renderer.js').default} */
	renderer;

	/** @type {import('estree').Identifier} */
	name;

	/** @type {string} */
	type;

	/** @type {string} */
	comment;

	/** @type {import('./wrappers/shared/Wrapper.js').default[]} */
	wrappers;

	/** @type {import('estree').Identifier} */
	key;

	/** @type {import('estree').Identifier} */
	first;

	/** @type {Set<string>} */
	dependencies = new Set();

	/** @type {Map<string, Bindings>} */
	bindings;

	/** @type {Set<string>} */
	binding_group_initialised = new Set();

	/** @type {Set<import('./Renderer.js').BindingGroup>} */
	binding_groups = new Set();
	/**
	 * @type {{
	 * 		declarations: Array<import('estree').Node | import('estree').Node[]>;
	 * 		init: Array<import('estree').Node | import('estree').Node[]>;
	 * 		create: Array<import('estree').Node | import('estree').Node[]>;
	 * 		claim: Array<import('estree').Node | import('estree').Node[]>;
	 * 		hydrate: Array<import('estree').Node | import('estree').Node[]>;
	 * 		mount: Array<import('estree').Node | import('estree').Node[]>;
	 * 		measure: Array<import('estree').Node | import('estree').Node[]>;
	 * 		restore_measurements: Array<import('estree').Node | import('estree').Node[]>;
	 * 		fix: Array<import('estree').Node | import('estree').Node[]>;
	 * 		animate: Array<import('estree').Node | import('estree').Node[]>;
	 * 		intro: Array<import('estree').Node | import('estree').Node[]>;
	 * 		update: Array<import('estree').Node | import('estree').Node[]>;
	 * 		outro: Array<import('estree').Node | import('estree').Node[]>;
	 * 		destroy: Array<import('estree').Node | import('estree').Node[]>;
	 * 	}}
	 */
	chunks;

	/** @type {import('estree').Node[]} */
	event_listeners = [];

	/** @type {boolean} */
	maintain_context;

	/** @type {boolean} */
	has_animation;

	/** @type {boolean} */
	has_intros;

	/** @type {boolean} */
	has_outros;

	/** @type {boolean} */
	has_intro_method; // could have the method without the transition, due to siblings

	/** @type {boolean} */
	has_outro_method;

	/** @type {number} */
	outros;

	/** @type {Map<string, import('estree').Identifier>} */
	aliases;

	/** @type {Map<string, { id: import('estree').Identifier; init?: import('estree').Node }>} */
	variables = new Map();

	/** @type {(name: string) => import('estree').Identifier} */
	get_unique_name;
	/** */
	has_update_method = false;

	/** @type {{ element_var: string; condition_expression?: any }} */
	autofocus;

	/** @param {BlockOptions} options */
	constructor(options) {
		this.parent = options.parent;
		this.renderer = options.renderer;
		this.name = options.name;
		this.type = options.type;
		this.comment = options.comment;
		this.wrappers = [];
		// for keyed each blocks
		this.key = options.key;
		this.first = null;
		this.bindings = options.bindings;
		this.chunks = {
			declarations: [],
			init: [],
			create: [],
			claim: [],
			hydrate: [],
			mount: [],
			measure: [],
			restore_measurements: [],
			fix: [],
			animate: [],
			intro: [],
			update: [],
			outro: [],
			destroy: []
		};
		this.has_animation = false;
		this.has_intro_method = false; // a block could have an intro method but not intro transitions, e.g. if a sibling block has intros
		this.has_outro_method = false;
		this.outros = 0;
		this.get_unique_name = this.renderer.component.get_unique_name_maker();
		this.aliases = new Map();
		if (this.key) this.aliases.set('key', this.get_unique_name('key'));
	}

	assign_variable_names() {
		/** @type {Set<string>} */
		const seen = new Set();

		/** @type {Set<string>} */
		const dupes = new Set();
		let i = this.wrappers.length;
		while (i--) {
			const wrapper = this.wrappers[i];
			if (!wrapper.var) continue;
			if (seen.has(wrapper.var.name)) {
				dupes.add(wrapper.var.name);
			}
			seen.add(wrapper.var.name);
		}
		const counts = new Map();
		i = this.wrappers.length;
		while (i--) {
			const wrapper = this.wrappers[i];
			if (!wrapper.var) continue;
			let suffix = '';
			if (dupes.has(wrapper.var.name)) {
				const i = counts.get(wrapper.var.name) || 0;
				counts.set(wrapper.var.name, i + 1);
				suffix = i;
			}
			wrapper.var.name = this.get_unique_name(wrapper.var.name + suffix).name;
		}
	}

	/** @param {Set<string>} dependencies */
	add_dependencies(dependencies) {
		dependencies.forEach((dependency) => {
			this.dependencies.add(dependency);
		});
		this.has_update_method = true;
		if (this.parent) {
			this.parent.add_dependencies(dependencies);
		}
	}

	/**
	 * @param {import('estree').Identifier} id
	 * @param {import('estree').Node} render_statement
	 * @param {import('estree').Node} claim_statement
	 * @param {import('estree').Node} parent_node
	 * @param {boolean} [no_detach]
	 */
	add_element(id, render_statement, claim_statement, parent_node, no_detach) {
		this.add_variable(id);
		this.chunks.create.push(b`${id} = ${render_statement};`);
		if (this.renderer.options.hydratable) {
			this.chunks.claim.push(b`${id} = ${claim_statement || render_statement};`);
		}
		if (parent_node) {
			this.chunks.mount.push(b`@append(${parent_node}, ${id});`);
			if (is_head(parent_node) && !no_detach) this.chunks.destroy.push(b`@detach(${id});`);
		} else {
			this.chunks.mount.push(b`@insert(#target, ${id}, #anchor);`);
			if (!no_detach) this.chunks.destroy.push(b`if (detaching) @detach(${id});`);
		}
	}

	/** @param {boolean} [local] */
	add_intro(local) {
		this.has_intros = this.has_intro_method = true;
		if (!local && this.parent) this.parent.add_intro();
	}

	/** @param {boolean} [local] */
	add_outro(local) {
		this.has_outros = this.has_outro_method = true;
		this.outros += 1;
		if (!local && this.parent) this.parent.add_outro();
	}

	add_animation() {
		this.has_animation = true;
	}

	/**
	 * @param {import('estree').Identifier} id
	 * @param {import('estree').Node} [init]
	 */
	add_variable(id, init) {
		if (this.variables.has(id.name)) {
			throw new Error(`Variable '${id.name}' already initialised with a different value`);
		}
		this.variables.set(id.name, { id, init });
	}

	/** @param {string} name */
	alias(name) {
		if (!this.aliases.has(name)) {
			this.aliases.set(name, this.get_unique_name(name));
		}
		return this.aliases.get(name);
	}

	/** @param {BlockOptions} options */
	child(options) {
		return new Block(Object.assign({}, this, { key: null }, options, { parent: this }));
	}

	/** @param {any} [key] */
	get_contents(key) {
		const { dev } = this.renderer.options;
		if (this.has_outros) {
			this.add_variable({ type: 'Identifier', name: '#current' });
			if (this.chunks.intro.length > 0) {
				this.chunks.intro.push(b`#current = true;`);
				this.chunks.mount.push(b`#current = true;`);
			}
			if (this.chunks.outro.length > 0) {
				this.chunks.outro.push(b`#current = false;`);
			}
		}
		if (this.autofocus) {
			if (this.autofocus.condition_expression) {
				this.chunks.mount.push(
					b`if (${this.autofocus.condition_expression}) ${this.autofocus.element_var}.focus();`
				);
			} else {
				this.chunks.mount.push(b`${this.autofocus.element_var}.focus();`);
			}
		}
		this.render_binding_groups();
		this.render_listeners();

		/** @type {Record<string, any>} */
		const properties = {};
		const noop = x`@noop`;
		properties.key = key;
		if (this.first) {
			properties.first = x`null`;
			this.chunks.hydrate.push(b`this.first = ${this.first};`);
		}
		if (this.chunks.create.length === 0 && this.chunks.hydrate.length === 0) {
			properties.create = noop;
		} else {
			const hydrate =
				this.chunks.hydrate.length > 0 &&
				(this.renderer.options.hydratable ? b`this.h();` : this.chunks.hydrate);
			properties.create = x`function #create() {
				${this.chunks.create}
				${hydrate}
			}`;
		}
		if (this.renderer.options.hydratable || this.chunks.claim.length > 0) {
			if (this.chunks.claim.length === 0 && this.chunks.hydrate.length === 0) {
				properties.claim = noop;
			} else {
				properties.claim = x`function #claim(#nodes) {
					${this.chunks.claim}
					${this.renderer.options.hydratable && this.chunks.hydrate.length > 0 && b`this.h();`}
				}`;
			}
		}
		if (this.renderer.options.hydratable && this.chunks.hydrate.length > 0) {
			properties.hydrate = x`function #hydrate() {
				${this.chunks.hydrate}
			}`;
		}
		if (this.chunks.mount.length === 0) {
			properties.mount = noop;
		} else if (this.event_listeners.length === 0) {
			properties.mount = x`function #mount(#target, #anchor) {
				${this.chunks.mount}
			}`;
		} else {
			properties.mount = x`function #mount(#target, #anchor) {
				${this.chunks.mount}
			}`;
		}
		if (this.has_update_method || this.maintain_context) {
			if (this.chunks.update.length === 0 && !this.maintain_context) {
				properties.update = noop;
			} else {
				const ctx = this.maintain_context ? x`#new_ctx` : x`#ctx`;

				/** @type {import('estree').Identifier | import('estree').ArrayPattern} */
				let dirty = { type: 'Identifier', name: '#dirty' };
				if (!this.renderer.context_overflow && !this.parent) {
					dirty = { type: 'ArrayPattern', elements: [dirty] };
				}
				properties.update = x`function #update(${ctx}, ${dirty}) {
					${this.maintain_context && b`#ctx = ${ctx};`}
					${this.chunks.update}
				}`;
			}
		}
		if (this.has_animation) {
			properties.measure = x`function #measure() {
				${this.chunks.measure}
			}`;
			if (this.chunks.restore_measurements.length) {
				properties.restore_measurements = x`function #restore_measurements(#measurement) {
					${this.chunks.restore_measurements}
				}`;
			}
			properties.fix = x`function #fix() {
				${this.chunks.fix}
			}`;
			properties.animate = x`function #animate() {
				${this.chunks.animate}
			}`;
		}
		if (this.has_intro_method || this.has_outro_method) {
			if (this.chunks.intro.length === 0) {
				properties.intro = noop;
			} else {
				properties.intro = x`function #intro(#local) {
					${this.has_outros && b`if (#current) return;`}
					${this.chunks.intro}
				}`;
			}
			if (this.chunks.outro.length === 0) {
				properties.outro = noop;
			} else {
				properties.outro = x`function #outro(#local) {
					${this.chunks.outro}
				}`;
			}
		}
		if (this.chunks.destroy.length === 0) {
			properties.destroy = noop;
		} else {
			const dispose_elements = [];
			// Coalesce if blocks with the same condition
			const others = flatten(this.chunks.destroy).filter(
				/** @param {import('estree').Node} node */
				(node) => {
					if (
						node.type === 'IfStatement' &&
						node.test.type === 'Identifier' &&
						node.test.name === 'detaching'
					) {
						dispose_elements.push(node.consequent);
						return false;
					} else {
						return true;
					}
				}
			);

			properties.destroy = x`function #destroy(detaching) {
				${dispose_elements.length ? b`if (detaching) { ${dispose_elements} }` : null}
				${others}
			}`;
		}
		if (!this.renderer.component.compile_options.dev) {
			// allow shorthand names
			for (const name in properties) {
				const property = properties[name];
				if (property) property.id = null;
			}
		}

		/** @type {any} */
		const return_value = x`{
			key: ${properties.key},
			first: ${properties.first},
			c: ${properties.create},
			l: ${properties.claim},
			h: ${properties.hydrate},
			m: ${properties.mount},
			p: ${properties.update},
			r: ${properties.measure},
			s: ${properties.restore_measurements},
			f: ${properties.fix},
			a: ${properties.animate},
			i: ${properties.intro},
			o: ${properties.outro},
			d: ${properties.destroy}
		}`;
		const block = dev && this.get_unique_name('block');
		const body = b`
			${this.chunks.declarations}

			${Array.from(this.variables.values()).map(({ id, init }) => {
				return init ? b`let ${id} = ${init}` : b`let ${id}`;
			})}

			${this.chunks.init}

			${
				dev
					? b`
					const ${block} = ${return_value};
					@dispatch_dev("SvelteRegisterBlock", {
						block: ${block},
						id: ${this.name || 'create_fragment'}.name,
						type: "${this.type}",
						source: "${this.comment ? this.comment.replace(regex_double_quotes, '\\"') : ''}",
						ctx: #ctx
					});
					return ${block};`
					: b`
					return ${return_value};`
			}
		`;
		return body;
	}

	/** @returns {boolean} */
	has_content() {
		return (
			!!this.first ||
			this.event_listeners.length > 0 ||
			this.chunks.intro.length > 0 ||
			this.chunks.outro.length > 0 ||
			this.chunks.create.length > 0 ||
			this.chunks.hydrate.length > 0 ||
			this.chunks.claim.length > 0 ||
			this.chunks.mount.length > 0 ||
			this.chunks.update.length > 0 ||
			this.chunks.destroy.length > 0 ||
			this.has_animation
		);
	}

	render() {
		const key = this.key && this.get_unique_name('key');

		/** @type {any[]} */
		const args = [x`#ctx`];
		if (key) args.unshift(key);
		const fn = b`function ${this.name}(${args}) {
			${this.get_contents(key)}
		}`;
		return this.comment
			? b`
				// ${this.comment}
				${fn}`
			: fn;
	}

	/** @param {string} chunk */
	render_listeners(chunk = '') {
		if (this.event_listeners.length > 0) {
			this.add_variable({ type: 'Identifier', name: '#mounted' });
			this.chunks.destroy.push(b`#mounted = false`);

			/** @type {import('estree').Identifier} */
			const dispose = {
				type: 'Identifier',
				name: `#dispose${chunk}`
			};
			this.add_variable(dispose);
			if (this.event_listeners.length === 1) {
				this.chunks.mount.push(b`
						if (!#mounted) {
							${dispose} = ${this.event_listeners[0]};
							#mounted = true;
						}
					`);
				this.chunks.destroy.push(b`${dispose}();`);
			} else {
				this.chunks.mount.push(b`
					if (!#mounted) {
						${dispose} = [
							${this.event_listeners}
						];
						#mounted = true;
					}
				`);
				this.chunks.destroy.push(b`@run_all(${dispose});`);
			}
		}
	}
	render_binding_groups() {
		for (const binding_group of this.binding_groups) {
			binding_group.render(this);
		}
	}
}
