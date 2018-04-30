import CodeBuilder from '../../utils/CodeBuilder';
import deindent from '../../utils/deindent';
import { escape } from '../../utils/stringify';
import Compiler from '../Compiler';
import { Node } from '../../interfaces';

export interface BlockOptions {
	name: string;
	compiler?: Compiler;
	comment?: string;
	key?: string;
	bindings?: Map<string, string>;
	dependencies?: Set<string>;
}

export default class Block {
	compiler: Compiler;
	name: string;
	comment?: string;

	key: string;
	first: string;

	dependencies: Set<string>;

	bindings: Map<string, string>;

	builders: {
		init: CodeBuilder;
		create: CodeBuilder;
		claim: CodeBuilder;
		hydrate: CodeBuilder;
		mount: CodeBuilder;
		intro: CodeBuilder;
		update: CodeBuilder;
		outro: CodeBuilder;
		unmount: CodeBuilder;
		detachRaw: CodeBuilder;
		destroy: CodeBuilder;
	};

	hasIntroMethod: boolean;
	hasOutroMethod: boolean;
	outros: number;

	aliases: Map<string, string>;
	variables: Map<string, string>;
	getUniqueName: (name: string) => string;

	hasUpdateMethod: boolean;
	autofocus: string;

	constructor(options: BlockOptions) {
		this.compiler = options.compiler;
		this.name = options.name;
		this.comment = options.comment;

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
			intro: new CodeBuilder(),
			update: new CodeBuilder(),
			outro: new CodeBuilder(),
			unmount: new CodeBuilder(),
			detachRaw: new CodeBuilder(),
			destroy: new CodeBuilder(),
		};

		this.hasIntroMethod = false; // a block could have an intro method but not intro transitions, e.g. if a sibling block has intros
		this.hasOutroMethod = false;
		this.outros = 0;

		this.getUniqueName = this.compiler.getUniqueNameMaker();
		this.variables = new Map();

		this.aliases = new Map()
			.set('component', this.getUniqueName('component'))
			.set('ctx', this.getUniqueName('ctx'));
		if (this.key) this.aliases.set('key', this.getUniqueName('key'));

		this.hasUpdateMethod = false; // determined later
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
		parentNode: string
	) {
		this.addVariable(name);
		this.builders.create.addLine(`${name} = ${renderStatement};`);
		this.builders.claim.addLine(`${name} = ${claimStatement || renderStatement};`);

		if (parentNode) {
			this.builders.mount.addLine(`@appendNode(${name}, ${parentNode});`);
			if (parentNode === 'document.head') this.builders.unmount.addLine(`@detachNode(${name});`);
		} else {
			this.builders.mount.addLine(`@insertNode(${name}, #target, anchor);`);
			this.builders.unmount.addLine(`@detachNode(${name});`);
		}
	}

	addVariable(name: string, init?: string) {
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

	toString() {
		const { dev } = this.compiler.options;

		let introing;
		const hasIntros = !this.builders.intro.isEmpty();
		if (hasIntros) {
			introing = this.getUniqueName('introing');
			this.addVariable(introing);
		}

		let outroing;
		const hasOutros = !this.builders.outro.isEmpty();
		if (hasOutros) {
			outroing = this.alias('outroing');
			this.addVariable(outroing);
		}

		if (this.autofocus) {
			this.builders.mount.addLine(`${this.autofocus}.focus();`);
		}

		// minor hack – we need to ensure that any {{{triples}}} are detached first
		this.builders.unmount.addBlockAtStart(this.builders.detachRaw.toString());

		const properties = new CodeBuilder();

		let localKey;
		if (this.key) {
			localKey = this.getUniqueName('key');
			properties.addBlock(`key: ${localKey},`);
		}

		if (this.first) {
			properties.addBlock(`first: null,`);
			this.builders.hydrate.addLine(`this.first = ${this.first};`);
		}

		if (this.builders.create.isEmpty() && this.builders.hydrate.isEmpty()) {
			properties.addBlock(`c: @noop,`);
		} else {
			const hydrate = !this.builders.hydrate.isEmpty() && (
				this.compiler.options.hydratable
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

		if (this.compiler.options.hydratable) {
			if (this.builders.claim.isEmpty() && this.builders.hydrate.isEmpty()) {
				properties.addBlock(`l: @noop,`);
			} else {
				properties.addBlock(deindent`
					${dev ? 'l: function claim' : 'l'}(nodes) {
						${this.builders.claim}
						${!this.builders.hydrate.isEmpty() && `this.h();`}
					},
				`);
			}
		}

		if (this.compiler.options.hydratable && !this.builders.hydrate.isEmpty()) {
			properties.addBlock(deindent`
				${dev ? 'h: function hydrate' : 'h'}() {
					${this.builders.hydrate}
				},
			`);
		}

		if (this.builders.mount.isEmpty()) {
			properties.addBlock(`m: @noop,`);
		} else {
			properties.addBlock(deindent`
				${dev ? 'm: function mount' : 'm'}(#target, anchor) {
					${this.builders.mount}
				},
			`);
		}

		if (this.hasUpdateMethod || this.maintainContext) {
			if (this.builders.update.isEmpty() && !this.maintainContext) {
				properties.addBlock(`p: @noop,`);
			} else {
				properties.addBlock(deindent`
					${dev ? 'p: function update' : 'p'}(changed, ${this.maintainContext ? '_ctx' : 'ctx'}) {
						${this.maintainContext && `ctx = _ctx;`}
						${this.builders.update}
					},
				`);
			}
		}

		if (this.hasIntroMethod) {
			if (hasIntros) {
				properties.addBlock(deindent`
					${dev ? 'i: function intro' : 'i'}(#target, anchor) {
						if (${introing}) return;
						${introing} = true;
						${hasOutros && `${outroing} = false;`}

						${this.builders.intro}

						this.m(#target, anchor);
					},
				`);
			} else {
				properties.addBlock(deindent`
					${dev ? 'i: function intro' : 'i'}(#target, anchor) {
						this.m(#target, anchor);
					},
				`);
			}
		}

		if (this.hasOutroMethod) {
			if (hasOutros) {
				properties.addBlock(deindent`
					${dev ? 'o: function outro' : 'o'}(#outrocallback) {
						if (${outroing}) return;
						${outroing} = true;
						${hasIntros && `${introing} = false;`}

						var #outros = ${this.outros};

						${this.builders.outro}
					},
				`);
			} else {
				properties.addBlock(deindent`
					o: @run,
				`);
			}
		}

		if (this.builders.unmount.isEmpty()) {
			properties.addBlock(`u: @noop,`);
		} else {
			properties.addBlock(deindent`
				${dev ? 'u: function unmount' : 'u'}() {
					${this.builders.unmount}
				},
			`);
		}

		if (this.builders.destroy.isEmpty()) {
			properties.addBlock(`d: @noop`);
		} else {
			properties.addBlock(deindent`
				${dev ? 'd: function destroy' : 'd'}() {
					${this.builders.destroy}
				}
			`);
		}

		return deindent`
			${this.comment && `// ${escape(this.comment)}`}
			function ${this.name}(#component${this.key ? `, ${localKey}` : ''}, ctx) {
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
			}
		`.replace(/(#+)(\w*)/g, (match: string, sigil: string, name: string) => {
			return sigil === '#' ? this.alias(name) : sigil.slice(1) + name;
		});
	}
}
