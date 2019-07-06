import CodeBuilder from '../utils/CodeBuilder';
import deindent from '../utils/deindent';
import Renderer from './Renderer';
import Wrapper from './wrappers/shared/Wrapper';
import { escape } from '../utils/stringify';

export interface BlockOptions {
	parent?: Block;
	name: string;
	renderer?: Renderer;
	comment?: string;
	key?: string;
	bindings?: Map<string, { object: string; property: string; snippet: string }>;
	dependencies?: Set<string>;
}

export default class Block {
	parent?: Block;
	renderer: Renderer;
	name: string;
	comment?: string;

	wrappers: Wrapper[];

	key: string;
	first: string;

	dependencies: Set<string>;

	bindings: Map<string, { object: string; property: string; snippet: string }>;

	builders: {
		init: CodeBuilder;
		create: CodeBuilder;
		claim: CodeBuilder;
		hydrate: CodeBuilder;
		mount: CodeBuilder;
		measure: CodeBuilder;
		fix: CodeBuilder;
		animate: CodeBuilder;
		intro: CodeBuilder;
		update: CodeBuilder;
		outro: CodeBuilder;
		destroy: CodeBuilder;
	};

	event_listeners: string[] = [];

	maintain_context: boolean;
	has_animation: boolean;
	has_intros: boolean;
	has_outros: boolean;
	has_intro_method: boolean; // could have the method without the transition, due to siblings
	has_outro_method: boolean;
	outros: number;

	aliases: Map<string, string>;
	variables: Map<string, string>;
	get_unique_name: (name: string) => string;

	has_update_method = false;
	autofocus: string;

	constructor(options: BlockOptions) {
		this.parent = options.parent;
		this.renderer = options.renderer;
		this.name = options.name;
		this.comment = options.comment;

		this.wrappers = [];

		// for keyed each blocks
		this.key = options.key;
		this.first = null;

		this.dependencies = new Set();

		this.bindings = options.bindings;

		this.builders = {
			init: new CodeBuilder(),
			create: new CodeBuilder(),
			claim: new CodeBuilder(),
			hydrate: new CodeBuilder(),
			mount: new CodeBuilder(),
			measure: new CodeBuilder(),
			fix: new CodeBuilder(),
			animate: new CodeBuilder(),
			intro: new CodeBuilder(),
			update: new CodeBuilder(),
			outro: new CodeBuilder(),
			destroy: new CodeBuilder(),
		};

		this.has_animation = false;
		this.has_intro_method = false; // a block could have an intro method but not intro transitions, e.g. if a sibling block has intros
		this.has_outro_method = false;
		this.outros = 0;

		this.get_unique_name = this.renderer.component.get_unique_name_maker();
		this.variables = new Map();

		this.aliases = new Map().set('ctx', this.get_unique_name('ctx'));
		if (this.key) this.aliases.set('key', this.get_unique_name('key'));
	}

	assign_variable_names() {
		const seen = new Set();
		const dupes = new Set();

		let i = this.wrappers.length;

		while (i--) {
			const wrapper = this.wrappers[i];

			if (!wrapper.var) continue;
			if (wrapper.parent && wrapper.parent.can_use_innerhtml) continue;

			if (seen.has(wrapper.var)) {
				dupes.add(wrapper.var);
			}

			seen.add(wrapper.var);
		}

		const counts = new Map();
		i = this.wrappers.length;

		while (i--) {
			const wrapper = this.wrappers[i];

			if (!wrapper.var) continue;

			if (dupes.has(wrapper.var)) {
				const i = counts.get(wrapper.var) || 0;
				counts.set(wrapper.var, i + 1);
				wrapper.var = this.get_unique_name(wrapper.var + i);
			} else {
				wrapper.var = this.get_unique_name(wrapper.var);
			}
		}
	}

	add_dependencies(dependencies: Set<string>) {
		dependencies.forEach(dependency => {
			this.dependencies.add(dependency);
		});

		this.has_update_method = true;
	}

	add_element(
		name: string,
		render_statement: string,
		claim_statement: string,
		parent_node: string,
		no_detach?: boolean
	) {
		this.add_variable(name);
		this.builders.create.add_line(`${name} = ${render_statement};`);

		if (this.renderer.options.hydratable) {
			this.builders.claim.add_line(`${name} = ${claim_statement || render_statement};`);
		}

		if (parent_node) {
			this.builders.mount.add_line(`@append(${parent_node}, ${name});`);
			if (parent_node === '@_document.head' && !no_detach) this.builders.destroy.add_line(`@detach(${name});`);
		} else {
			this.builders.mount.add_line(`@insert(#target, ${name}, anchor);`);
			if (!no_detach) this.builders.destroy.add_conditional('detaching', `@detach(${name});`);
		}
	}

	add_intro(local?: boolean) {
		this.has_intros = this.has_intro_method = true;
		if (!local && this.parent) this.parent.add_intro();
	}

	add_outro(local?: boolean) {
		this.has_outros = this.has_outro_method = true;
		this.outros += 1;
		if (!local && this.parent) this.parent.add_outro();
	}

	add_animation() {
		this.has_animation = true;
	}

	add_variable(name: string, init?: string) {
		if (name[0] === '#') {
			name = this.alias(name.slice(1));
		}

		if (this.variables.has(name) && this.variables.get(name) !== init) {
			throw new Error(
				`Variable '${name}' already initialised with a different value`
			);
		}

		this.variables.set(name, init);
	}

	alias(name: string) {
		if (!this.aliases.has(name)) {
			this.aliases.set(name, this.get_unique_name(name));
		}

		return this.aliases.get(name);
	}

	child(options: BlockOptions) {
		return new Block(Object.assign({}, this, { key: null }, options, { parent: this }));
	}

	get_contents(local_key?: string) {
		const { dev } = this.renderer.options;

		if (this.has_outros) {
			this.add_variable('#current');

			if (!this.builders.intro.is_empty()) {
				this.builders.intro.add_line(`#current = true;`);
				this.builders.mount.add_line(`#current = true;`);
			}

			if (!this.builders.outro.is_empty()) {
				this.builders.outro.add_line(`#current = false;`);
			}
		}

		if (this.autofocus) {
			this.builders.mount.add_line(`${this.autofocus}.focus();`);
		}

		this.render_listeners();

		const properties = new CodeBuilder();

		const method_name = (short: string, long: string) => dev ? `${short}: function ${this.get_unique_name(long)}` : short;

		if (local_key) {
			properties.add_block(`key: ${local_key},`);
		}

		if (this.first) {
			properties.add_block(`first: null,`);
			this.builders.hydrate.add_line(`this.first = ${this.first};`);
		}

		if (this.builders.create.is_empty() && this.builders.hydrate.is_empty()) {
			properties.add_line(`c: @noop,`);
		} else {
			const hydrate = !this.builders.hydrate.is_empty() && (
				this.renderer.options.hydratable
					? `this.h()`
					: this.builders.hydrate
			);

			properties.add_block(deindent`
				${method_name('c', 'create')}() {
					${this.builders.create}
					${hydrate}
				},
			`);
		}

		if (this.renderer.options.hydratable || !this.builders.claim.is_empty()) {
			if (this.builders.claim.is_empty() && this.builders.hydrate.is_empty()) {
				properties.add_line(`l: @noop,`);
			} else {
				properties.add_block(deindent`
					${method_name('l', 'claim')}(nodes) {
						${this.builders.claim}
						${this.renderer.options.hydratable && !this.builders.hydrate.is_empty() && `this.h();`}
					},
				`);
			}
		}

		if (this.renderer.options.hydratable && !this.builders.hydrate.is_empty()) {
			properties.add_block(deindent`
				${method_name('h', 'hydrate')}() {
					${this.builders.hydrate}
				},
			`);
		}

		if (this.builders.mount.is_empty()) {
			properties.add_line(`m: @noop,`);
		} else {
			properties.add_block(deindent`
				${method_name('m', 'mount')}(#target, anchor) {
					${this.builders.mount}
				},
			`);
		}

		if (this.has_update_method || this.maintain_context) {
			if (this.builders.update.is_empty() && !this.maintain_context) {
				properties.add_line(`p: @noop,`);
			} else {
				properties.add_block(deindent`
					${method_name('p', 'update')}(changed, ${this.maintain_context ? 'new_ctx' : 'ctx'}) {
						${this.maintain_context && `ctx = new_ctx;`}
						${this.builders.update}
					},
				`);
			}
		}

		if (this.has_animation) {
			properties.add_block(deindent`
				${method_name('r', 'measure')}() {
					${this.builders.measure}
				},

				${method_name('f', 'fix')}() {
					${this.builders.fix}
				},

				${method_name('a', 'animate')}() {
					${this.builders.animate}
				},
			`);
		}

		if (this.has_intro_method || this.has_outro_method) {
			if (this.builders.intro.is_empty()) {
				properties.add_line(`i: @noop,`);
			} else {
				properties.add_block(deindent`
					${method_name('i', 'intro')}(#local) {
						${this.has_outros && `if (#current) return;`}
						${this.builders.intro}
					},
				`);
			}

			if (this.builders.outro.is_empty()) {
				properties.add_line(`o: @noop,`);
			} else {
				properties.add_block(deindent`
					${method_name('o', 'outro')}(#local) {
						${this.builders.outro}
					},
				`);
			}
		}

		if (this.builders.destroy.is_empty()) {
			properties.add_line(`d: @noop`);
		} else {
			properties.add_block(deindent`
				${method_name('d', 'destroy')}(detaching) {
					${this.builders.destroy}
				}
			`);
		}

		/* eslint-disable @typescript-eslint/indent,indent */
		return deindent`
			${this.variables.size > 0 &&
				`var ${Array.from(this.variables.keys())
					.map(key => {
						const init = this.variables.get(key);
						return init !== undefined ? `${key} = ${init}` : key;
					})
					.join(', ')};`}

			${!this.builders.init.is_empty() && this.builders.init}

			return {
				${properties}
			};
		`.replace(/(#+)(\w*)/g, (_match: string, sigil: string, name: string) => {
			return sigil === '#' ? this.alias(name) : sigil.slice(1) + name;
		});
		/* eslint-enable @typescript-eslint/indent,indent */
	}

	render_listeners(chunk: string = '') {
		if (this.event_listeners.length > 0) {
			this.add_variable(`#dispose${chunk}`);

			if (this.event_listeners.length === 1) {
				this.builders.hydrate.add_line(
					`#dispose${chunk} = ${this.event_listeners[0]};`
				);

				this.builders.destroy.add_line(
					`#dispose${chunk}();`
				);
			} else {
				this.builders.hydrate.add_block(deindent`
					#dispose${chunk} = [
						${this.event_listeners.join(',\n')}
					];
				`);

				this.builders.destroy.add_line(
					`@run_all(#dispose${chunk});`
				);
			}
		}
	}

	toString() {
		const local_key = this.key && this.get_unique_name('key');

		return deindent`
			${this.comment && `// ${escape(this.comment, { only_escape_at_symbol: true })}`}
			function ${this.name}(${this.key ? `${local_key}, ` : ''}ctx) {
				${this.get_contents(local_key)}
			}
		`;
	}
}
