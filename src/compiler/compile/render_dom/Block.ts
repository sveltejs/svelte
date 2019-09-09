import Renderer from './Renderer';
import Wrapper from './wrappers/shared/Wrapper';
import { escape } from '../utils/stringify';
import { b, x } from 'code-red';
import { Node } from '../../interfaces';

export interface BlockOptions {
	parent?: Block;
	name: string;
	type: string;
	renderer?: Renderer;
	comment?: string;
	key?: string;
	bindings?: Map<string, { object: string; property: string; snippet: string; store: string; tail: string }>;
	dependencies?: Set<string>;
}

export default class Block {
	parent?: Block;
	renderer: Renderer;
	name: string;
	type: string;
	comment?: string;

	wrappers: Wrapper[];

	key: string;
	first: string;

	dependencies: Set<string>;

	bindings: Map<string, { object: string; property: string; snippet: string; store: string; tail: string }>;

	chunks: {
		init: Node[];
		create: Node[];
		claim: Node[];
		hydrate: Node[];
		mount: Node[];
		measure: Node[];
		fix: Node[];
		animate: Node[];
		intro: Node[];
		update: Node[];
		outro: Node[];
		destroy: Node[];
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
		this.type = options.type;
		this.comment = options.comment;

		this.wrappers = [];

		// for keyed each blocks
		this.key = options.key;
		this.first = null;

		this.dependencies = new Set();

		this.bindings = options.bindings;

		this.chunks = {
			init: [],
			create: [],
			claim: [],
			hydrate: [],
			mount: [],
			measure: [],
			fix: [],
			animate: [],
			intro: [],
			update: [],
			outro: [],
			destroy: [],
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
		this.chunks.create.push(b`${name} = ${render_statement};`);

		if (this.renderer.options.hydratable) {
			this.chunks.claim.push(b`${name} = ${claim_statement || render_statement};`);
		}

		if (parent_node) {
			this.chunks.mount.push(b`@append(${parent_node}, ${name});`);
			if (parent_node === '@_document.head' && !no_detach) this.chunks.destroy.push(b`@detach(${name});`);
		} else {
			this.chunks.mount.push(b`@insert(#target, ${name}, anchor);`);
			if (!no_detach) this.chunks.destroy.push(b`if (detaching) @detach(${name});`);
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

	get_contents(key?: any) {
		const { dev } = this.renderer.options;

		if (this.has_outros) {
			this.add_variable('#current');

			if (this.chunks.intro.length > 0) {
				this.chunks.intro.push(b`#current = true;`);
				this.chunks.mount.push(b`#current = true;`);
			}

			if (this.chunks.outro.length > 0) {
				this.chunks.outro.push(b`#current = false;`);
			}
		}

		if (this.autofocus) {
			this.chunks.mount.push(b`${this.autofocus}.focus();`);
		}

		this.render_listeners();

		const properties: Record<string, any> = {};

		const noop = x`noop`;

		properties.key = key
		properties.first = this.first;

		if (this.chunks.create.length === 0 && this.chunks.hydrate.length === 0) {
			properties.create = noop;
		} else {
			const hydrate = this.chunks.hydrate.length > 0 && (
				this.renderer.options.hydratable
					? b`this.h();`
					: this.chunks.hydrate
			);

			properties.create = b`function create() {
				${this.chunks.create}
				${hydrate}
			}`;
		}

		if (this.renderer.options.hydratable || this.chunks.claim.length > 0) {
			if (this.chunks.claim.length === 0 && this.chunks.hydrate.length === 0) {
				properties.claim = noop;
			} else {
				properties.claim = x`function claim(#nodes) {
					${this.chunks.claim}
					${this.renderer.options.hydratable && this.chunks.hydrate.length > 0 && b`this.h();`}
				}`;
			}
		}

		if (this.renderer.options.hydratable && this.chunks.hydrate.length > 0) {
			properties.hydrate = x`function hydrate() {
				${this.chunks.hydrate}
			}`;
		}

		if (this.chunks.mount.length === 0) {
			properties.mount = noop;
		} else {
			properties.mount = x`function mount(#target, anchor) {
				${this.chunks.mount}
			}`;
		}

		if (this.has_update_method || this.maintain_context) {
			if (this.chunks.update.length === 0 && !this.maintain_context) {
				properties.update = noop;
			} else {
				const ctx = this.maintain_context ? x`new_ctx` : x`ctx`;
				properties.update = x`function update(#changed, ${ctx}) {
					${this.maintain_context && b`ctx = ${ctx};`}
					${this.chunks.update}
				}`;
			}
		}

		if (this.has_animation) {
			properties.measure = x`function measure() {
				${this.chunks.measure}
			}`;

			properties.fix = x`function fix() {
				${this.chunks.fix}
			}`;

			properties.animate = x`function animate() {
				${this.chunks.animate}
			}`;
		}

		if (this.has_intro_method || this.has_outro_method) {
			if (this.chunks.intro.length === 0) {
				properties.intro = noop;
			} else {
				properties.intro = x`function intro(#local) {
					${this.has_outros && b`if (#current) return;`}
					${this.chunks.intro}
				}`;
			}

			if (this.chunks.outro.length === 0) {
				properties.outro = noop;
			} else {
				properties.outro = x`function outro(#local) {
					${this.chunks.outro}
				}`;
			}
		}

		if (this.chunks.destroy.length === 0) {
			properties.destroy = noop;
		} else {
			properties.destroy = x`function destroy(detaching) {
				${this.chunks.destroy}
			}`;
		}

		const return_value = x`{
			key: ${properties.key},
			first: ${properties.first},
			c: ${properties.create},
			l: ${properties.claim},
			h: ${properties.hydrate},
			m: ${properties.mount},
			p: ${properties.update},
			r: ${properties.measure},
			f: ${properties.fix},
			a: ${properties.animate},
			i: ${properties.intro},
			o: ${properties.outro},
			d: ${properties.destroy}
		}`;

		/* eslint-disable @typescript-eslint/indent,indent */
		return b`
			${Array.from(this.variables.entries()).map(([init, id]) => {
				const id_node = { type: 'Identifier', name: id };
				const init_node = { type: 'Identifier', name: init };

				return b`let ${id_node} = ${init_node}`;
			})}

			${this.chunks.init}

			${dev
				? b`
					const block = ${return_value};
					@dispatch_dev("SvelteRegisterBlock", { block, id: ${this.name || 'create_fragment'}.name, type: "${this.type}", source: "${this.comment ? this.comment.replace(/"/g, '\\"') : ''}", ctx });
					return block;`
				: b`
					return ${return_value};`
			}
		`;
		/* eslint-enable @typescript-eslint/indent,indent */
	}

	render() {
		const key = this.key && { type: 'Identifier', name: this.get_unique_name('key') };

		const id = { type: 'Identifier', name: this.name };
		const args: any[] = [x`ctx`];

		if (key) args.unshift(key);

		// TODO include this.comment

		return b`
			${this.comment && `// ${escape(this.comment, { only_escape_at_symbol: true })}`}
			function ${id}(${args}) {
				${this.get_contents(key)}
			}
		`;
	}

	render_listeners(chunk: string = '') {
		if (this.event_listeners.length > 0) {
			const name = `#dispose${chunk}`
			this.add_variable(name);

			const dispose = { type: 'Identifier', name };

			if (this.event_listeners.length === 1) {
				this.chunks.hydrate.push(
					b`${dispose} = ${this.event_listeners[0]};`
				);

				this.chunks.destroy.push(
					b`${dispose}();`
				);
			} else {
				this.chunks.hydrate.push(b`
					${dispose} = [
						${this.event_listeners.join(',\n')}
					];
				`);

				this.chunks.destroy.push(
					b`@run_all(${dispose});`
				);
			}
		}
	}

	// toString() {
	// 	const local_key = this.key && this.get_unique_name('key');

	// 	return deindent`
	// 		${this.comment && `// ${escape(this.comment, { only_escape_at_symbol: true })}`}
	// 		function ${this.name}(${this.key ? `${local_key}, ` : ''}ctx) {
	// 			${this.get_contents(local_key)}
	// 		}
	// 	`;
	// }
}
