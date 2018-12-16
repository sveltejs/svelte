import CodeBuilder from '../../utils/CodeBuilder';
import deindent from '../../utils/deindent';
import { escape } from '../../utils/stringify';
import Renderer from './Renderer';
import Wrapper from './wrappers/shared/Wrapper';
import EachBlockWrapper from './wrappers/EachBlock';

export interface BlockOptions {
	parent?: Block;
	name: string;
	renderer?: Renderer;
	comment?: string;
	key?: string;
	bindings?: Map<string, () => { object: string, property: string, snippet: string }>;
	contextOwners?: Map<string, EachBlockWrapper>;
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

	bindings: Map<string, () => { object: string, property: string, snippet: string }>;
	contextOwners: Map<string, EachBlockWrapper>;

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

	hasUpdateMethod: boolean;
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
		this.contextOwners = options.contextOwners;

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

		this.aliases = new Map()
			.set('component', this.getUniqueName('component'))
			.set('ctx', this.getUniqueName('ctx'));
		if (this.key) this.aliases.set('key', this.getUniqueName('key'));

		this.hasUpdateMethod = false; // determined later
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
	}

	addElement(
		name: string,
		renderStatement: string,
		claimStatement: string,
		parentNode: string,
		noDetach?: boolean
	) {
		this.addVariable(name);
		this.builders.create.addLine(`${name} = ${renderStatement};`);

		if (this.renderer.options.hydratable) {
			this.builders.claim.addLine(`${name} = ${claimStatement || renderStatement};`);
		}

		if (parentNode) {
			this.builders.mount.addLine(`@append(${parentNode}, ${name});`);
			if (parentNode === 'document.head') this.builders.destroy.addLine(`@detachNode(${name});`);
		} else {
			this.builders.mount.addLine(`@insert(#target, ${name}, anchor);`);
			if (!noDetach) this.builders.destroy.addConditional('detach', `@detachNode(${name});`);
		}
	}

	addIntro() {
		this.hasIntros = this.hasIntroMethod = this.renderer.hasIntroTransitions = true;
	}

	addOutro() {
		this.hasOutros = this.hasOutroMethod = this.renderer.hasOutroTransitions = true;
		this.outros += 1;
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

		if (this.hasIntroMethod || this.hasOutroMethod) {
			this.addVariable('#current');

			if (!this.builders.mount.isEmpty()) {
				this.builders.mount.addLine(`#current = true;`);
			}

			if (!this.builders.outro.isEmpty()) {
				this.builders.outro.addLine(`#current = false;`);
			}
		}

		if (this.autofocus) {
			this.builders.mount.addLine(`${this.autofocus}.focus();`);
		}

		if (this.event_listeners.length > 0) {
			this.addVariable('#dispose');

			if (this.event_listeners.length === 1) {
				this.builders.hydrate.addLine(
					`#dispose = ${this.event_listeners[0]};`
				);

				this.builders.destroy.addLine(
					`#dispose();`
				)
			} else {
				this.builders.hydrate.addBlock(deindent`
					#dispose = [
						${this.event_listeners.join(',\n')}
					];
				`);

				this.builders.destroy.addLine(
					`@run_all(#dispose);`
				);
			}
		}

		const properties = new CodeBuilder();

		if (localKey) {
			properties.addBlock(`key: ${localKey},`);
		}

		if (this.first) {
			properties.addBlock(`first: null,`);
			this.builders.hydrate.addLine(`this.first = ${this.first};`);
		}

		if (this.builders.create.isEmpty() && this.builders.hydrate.isEmpty()) {
			properties.addLine(`c: @noop,`);
		} else {
			const hydrate = !this.builders.hydrate.isEmpty() && (
				this.renderer.options.hydratable
					? `this.h()`
					: this.builders.hydrate
			);

			properties.addBlock(deindent`
				${dev ? 'c: function create' : 'c'}() {
					${this.builders.create}
					${hydrate}
				},
			`);
		}

		if (this.renderer.options.hydratable || !this.builders.claim.isEmpty()) {
			if (this.builders.claim.isEmpty() && this.builders.hydrate.isEmpty()) {
				properties.addLine(`l: @noop,`);
			} else {
				properties.addBlock(deindent`
					${dev ? 'l: function claim' : 'l'}(nodes) {
						${this.builders.claim}
						${this.renderer.options.hydratable && !this.builders.hydrate.isEmpty() && `this.h();`}
					},
				`);
			}
		}

		if (this.renderer.options.hydratable && !this.builders.hydrate.isEmpty()) {
			properties.addBlock(deindent`
				${dev ? 'h: function hydrate' : 'h'}() {
					${this.builders.hydrate}
				},
			`);
		}

		if (this.builders.mount.isEmpty()) {
			properties.addLine(`m: @noop,`);
		} else {
			properties.addBlock(deindent`
				${dev ? 'm: function mount' : 'm'}(#target, anchor) {
					${this.builders.mount}
				},
			`);
		}

		if (this.hasUpdateMethod || this.maintainContext) {
			if (this.builders.update.isEmpty() && !this.maintainContext) {
				properties.addLine(`p: @noop,`);
			} else {
				properties.addBlock(deindent`
					${dev ? 'p: function update' : 'p'}(changed, ${this.maintainContext ? 'new_ctx' : 'ctx'}) {
						${this.maintainContext && `ctx = new_ctx;`}
						${this.builders.update}
					},
				`);
			}
		}

		if (this.hasAnimation) {
			properties.addBlock(deindent`
				${dev ? `r: function measure` : `r`}() {
					${this.builders.measure}
				},

				${dev ? `f: function fix` : `f`}() {
					${this.builders.fix}
				},

				${dev ? `a: function animate` : `a`}() {
					${this.builders.animate}
				},
			`);
		}

		if (this.hasIntroMethod || this.hasOutroMethod) {
			if (this.builders.mount.isEmpty()) {
				properties.addLine(`i: @noop,`);
			} else {
				properties.addBlock(deindent`
					${dev ? 'i: function intro' : 'i'}(#target, anchor) {
						if (#current) return;
						${this.builders.intro}
						this.m(#target, anchor);
					},
				`);
			}

			if (this.builders.outro.isEmpty()) {
				properties.addLine(`o: @run,`);
			} else {
				properties.addBlock(deindent`
					${dev ? 'o: function outro' : 'o'}(#outrocallback) {
						if (!#current) return;

						${this.outros > 1 && `#outrocallback = @callAfter(#outrocallback, ${this.outros});`}

						${this.builders.outro}
					},
				`);
			}
		}

		if (this.builders.destroy.isEmpty()) {
			properties.addLine(`d: @noop`);
		} else {
			properties.addBlock(deindent`
				${dev ? 'd: function destroy' : 'd'}(detach) {
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

			${!this.builders.init.isEmpty() && this.builders.init}

			return {
				${properties}
			};
		`.replace(/(#+)(\w*)/g, (match: string, sigil: string, name: string) => {
			return sigil === '#' ? this.alias(name) : sigil.slice(1) + name;
		});
	}

	toString() {
		const localKey = this.key && this.getUniqueName('key');

		return deindent`
			${this.comment && `// ${escape(this.comment)}`}
			function ${this.name}(#component, ${this.key ? `${localKey}, ` : ''}ctx) {
				${this.getContents(localKey)}
			}
		`.replace(/(#+)(\w*)/g, (match: string, sigil: string, name: string) => {
			return sigil === '#' ? this.alias(name) : sigil.slice(1) + name;
		});
	}
}
