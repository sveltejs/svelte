import CodeBuilder from '../utils/CodeBuilder';
import deindent from '../utils/deindent';
import Renderer from './Renderer';
import Wrapper from './wrappers/shared/Wrapper';
import EachBlockWrapper from './wrappers/EachBlock';
import InlineComponentWrapper from './wrappers/InlineComponent';
import ElementWrapper from './wrappers/Element';

export interface BlockOptions {
	parent?: Block;
	name: string;
	renderer?: Renderer;
	comment?: string;
	key?: string;
	bindings?: Map<string, () => { object: string, property: string, snippet: string }>;
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

	bindings: Map<string, { object: string, property: string, snippet: string }>;

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

	maintainContext: boolean;
	hasAnimation: boolean;
	hasIntros: boolean;
	hasOutros: boolean;
	hasIntroMethod: boolean; // could have the method without the transition, due to siblings
	hasOutroMethod: boolean;
	outros: number;

	aliases: Map<string, string>;
	variables: Map<string, string>;
	getUniqueName: (name: string) => string;

	hasUpdateMethod = false;
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

		this.hasAnimation = false;
		this.hasIntroMethod = false; // a block could have an intro method but not intro transitions, e.g. if a sibling block has intros
		this.hasOutroMethod = false;
		this.outros = 0;

		this.getUniqueName = this.renderer.component.getUniqueNameMaker();
		this.variables = new Map();

		this.aliases = new Map().set('ctx', this.getUniqueName('ctx'));
		if (this.key) this.aliases.set('key', this.getUniqueName('key'));
	}

	assignVariableNames() {
		const seen = new Set();
		const dupes = new Set();

		let i = this.wrappers.length;

		while (i--) {
			const wrapper = this.wrappers[i];

			if (!wrapper.var) continue;
			if (wrapper.parent && wrapper.parent.canUseInnerHTML) continue;

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
				wrapper.var = this.getUniqueName(wrapper.var + i);
			} else {
				wrapper.var = this.getUniqueName(wrapper.var);
			}
		}
	}

	addDependencies(dependencies: Set<string>) {
		dependencies.forEach(dependency => {
			this.dependencies.add(dependency);
		});

		this.hasUpdateMethod = true;
	}

	addElement(
		name: string,
		renderStatement: string,
		claimStatement: string,
		parentNode: string,
		noDetach?: boolean
	) {
		this.addVariable(name);
		this.builders.create.add_line(`${name} = ${renderStatement};`);

		if (this.renderer.options.hydratable) {
			this.builders.claim.add_line(`${name} = ${claimStatement || renderStatement};`);
		}

		if (parentNode) {
			this.builders.mount.add_line(`@append(${parentNode}, ${name});`);
			if (parentNode === 'document.head') this.builders.destroy.add_line(`@detachNode(${name});`);
		} else {
			this.builders.mount.add_line(`@insert(#target, ${name}, anchor);`);
			if (!noDetach) this.builders.destroy.add_conditional('detach', `@detachNode(${name});`);
		}
	}

	addIntro(local?: boolean) {
		this.hasIntros = this.hasIntroMethod = this.renderer.hasIntroTransitions = true;
		if (!local && this.parent) this.parent.addIntro();
	}

	addOutro(local?: boolean) {
		this.hasOutros = this.hasOutroMethod = this.renderer.hasOutroTransitions = true;
		this.outros += 1;
		if (!local && this.parent) this.parent.addOutro();
	}

	addAnimation() {
		this.hasAnimation = true;
	}

	addVariable(name: string, init?: string) {
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
			this.aliases.set(name, this.getUniqueName(name));
		}

		return this.aliases.get(name);
	}

	child(options: BlockOptions) {
		return new Block(Object.assign({}, this, { key: null }, options, { parent: this }));
	}

	getContents(localKey?: string) {
		const { dev } = this.renderer.options;

		if (this.hasOutros) {
			this.addVariable('#current');

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

		this.renderListeners();

		const properties = new CodeBuilder();

		const methodName = (short: string, long: string) => dev ? `${short}: function ${this.getUniqueName(long)}` : short;

		if (localKey) {
			properties.add_block(`key: ${localKey},`);
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
				${methodName('c', 'create')}() {
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
					${methodName('l', 'claim')}(nodes) {
						${this.builders.claim}
						${this.renderer.options.hydratable && !this.builders.hydrate.is_empty() && `this.h();`}
					},
				`);
			}
		}

		if (this.renderer.options.hydratable && !this.builders.hydrate.is_empty()) {
			properties.add_block(deindent`
				${methodName('h', 'hydrate')}() {
					${this.builders.hydrate}
				},
			`);
		}

		if (this.builders.mount.is_empty()) {
			properties.add_line(`m: @noop,`);
		} else {
			properties.add_block(deindent`
				${methodName('m', 'mount')}(#target, anchor) {
					${this.builders.mount}
				},
			`);
		}

		if (this.hasUpdateMethod || this.maintainContext) {
			if (this.builders.update.is_empty() && !this.maintainContext) {
				properties.add_line(`p: @noop,`);
			} else {
				properties.add_block(deindent`
					${methodName('p', 'update')}(changed, ${this.maintainContext ? 'new_ctx' : 'ctx'}) {
						${this.maintainContext && `ctx = new_ctx;`}
						${this.builders.update}
					},
				`);
			}
		}

		if (this.hasAnimation) {
			properties.add_block(deindent`
				${methodName('r', 'measure')}() {
					${this.builders.measure}
				},

				${methodName('f', 'fix')}() {
					${this.builders.fix}
				},

				${methodName('a', 'animate')}() {
					${this.builders.animate}
				},
			`);
		}

		if (this.hasIntroMethod || this.hasOutroMethod) {
			if (this.builders.intro.is_empty()) {
				properties.add_line(`i: @noop,`);
			} else {
				properties.add_block(deindent`
					${methodName('i', 'intro')}(#local) {
						${this.hasOutros && `if (#current) return;`}
						${this.builders.intro}
					},
				`);
			}

			if (this.builders.outro.is_empty()) {
				properties.add_line(`o: @noop,`);
			} else {
				properties.add_block(deindent`
					${methodName('o', 'outro')}(#local) {
						${this.builders.outro}
					},
				`);
			}
		}

		if (this.builders.destroy.is_empty()) {
			properties.add_line(`d: @noop`);
		} else {
			properties.add_block(deindent`
				${methodName('d', 'destroy')}(detach) {
					${this.builders.destroy}
				}
			`);
		}

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
		`.replace(/(#+)(\w*)/g, (match: string, sigil: string, name: string) => {
			return sigil === '#' ? this.alias(name) : sigil.slice(1) + name;
		});
	}

	renderListeners(chunk: string = '') {
		if (this.event_listeners.length > 0) {
			this.addVariable(`#dispose${chunk}`);

			if (this.event_listeners.length === 1) {
				this.builders.hydrate.add_line(
					`#dispose${chunk} = ${this.event_listeners[0]};`
				);

				this.builders.destroy.add_line(
					`#dispose${chunk}();`
				)
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
		const localKey = this.key && this.getUniqueName('key');

		return deindent`
			${this.comment && `// ${this.comment}`}
			function ${this.name}(${this.key ? `${localKey}, ` : ''}ctx) {
				${this.getContents(localKey)}
			}
		`;
	}
}
