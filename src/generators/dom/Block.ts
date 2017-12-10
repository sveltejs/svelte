import CodeBuilder from '../../utils/CodeBuilder';
import deindent from '../../utils/deindent';
import { escape } from '../../utils/stringify';
import { DomGenerator } from './index';
import { Node } from '../../interfaces';
import shared from './shared';

export interface BlockOptions {
	name: string;
	generator?: DomGenerator;
	expression?: Node;
	context?: string;
	destructuredContexts?: string[];
	comment?: string;
	key?: string;
	contexts?: Map<string, string>;
	indexes?: Map<string, string>;
	changeableIndexes?: Map<string, boolean>;
	params?: string[];
	indexNames?: Map<string, string>;
	listNames?: Map<string, string>;
	indexName?: string;
	listName?: string;
	dependencies?: Set<string>;
}

export default class Block {
	generator: DomGenerator;
	name: string;
	expression: Node;
	context: string;
	destructuredContexts?: string[];
	comment?: string;

	key: string;
	first: string;

	contexts: Map<string, string>;
	indexes: Map<string, string>;
	changeableIndexes: Map<string, boolean>;
	dependencies: Set<string>;
	params: string[];
	indexNames: Map<string, string>;
	listNames: Map<string, string>;
	indexName: string;
	listName: string;

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
		this.generator = options.generator;
		this.name = options.name;
		this.expression = options.expression;
		this.context = options.context;
		this.destructuredContexts = options.destructuredContexts;
		this.comment = options.comment;

		// for keyed each blocks
		this.key = options.key;
		this.first = null;

		this.contexts = options.contexts;
		this.indexes = options.indexes;
		this.changeableIndexes = options.changeableIndexes;
		this.dependencies = new Set();

		this.params = options.params;
		this.indexNames = options.indexNames;
		this.listNames = options.listNames;

		this.listName = options.listName;

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

		this.aliases = new Map();
		this.variables = new Map();
		this.getUniqueName = this.generator.getUniqueNameMaker(options.params);

		this.hasUpdateMethod = false; // determined later
	}

	addDependencies(dependencies: string[]) {
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
		this.builders.claim.addLine(`${name} = ${claimStatement};`);

		if (parentNode) {
			this.builders.mount.addLine(`@appendNode(${name}, ${parentNode});`);
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
		return new Block(Object.assign({}, this, options, { parent: this }));
	}

	contextualise(expression: Node, context?: string, isEventHandler?: boolean) {
		return this.generator.contextualise(this.contexts, this.indexes, expression, context, isEventHandler);
	}

	toString() {
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

		if (this.builders.create.isEmpty()) {
			properties.addBlock(`c: @noop,`);
		} else {
			properties.addBlock(deindent`
				c: function create() {
					${this.builders.create}
					${!this.builders.hydrate.isEmpty() && `this.h();`}
				},
			`);
		}

		if (this.generator.hydratable) {
			if (this.builders.claim.isEmpty()) {
				properties.addBlock(`l: @noop,`);
			} else {
				properties.addBlock(deindent`
					l: function claim(nodes) {
						${this.builders.claim}
						${!this.builders.hydrate.isEmpty() && `this.h();`}
					},
				`);
			}
		}

		if (!this.builders.hydrate.isEmpty()) {
			properties.addBlock(deindent`
				h: function hydrate() {
					${this.builders.hydrate}
				},
			`);
		}

		if (this.builders.mount.isEmpty()) {
			properties.addBlock(`m: @noop,`);
		} else {
			properties.addBlock(deindent`
				m: function mount(#target, anchor) {
					${this.builders.mount}
				},
			`);
		}

		if (this.hasUpdateMethod) {
			if (this.builders.update.isEmpty()) {
				properties.addBlock(`p: @noop,`);
			} else {
				properties.addBlock(deindent`
					p: function update(changed, ${this.params.join(', ')}) {
						${this.builders.update}
					},
				`);
			}
		}

		if (this.hasIntroMethod) {
			if (hasIntros) {
				properties.addBlock(deindent`
					i: function intro(#target, anchor) {
						if (${introing}) return;
						${introing} = true;
						${hasOutros && `${outroing} = false;`}

						${this.builders.intro}

						this.m(#target, anchor);
					},
				`);
			} else {
				properties.addBlock(deindent`
					i: function intro(#target, anchor) {
						this.m(#target, anchor);
					},
				`);
			}
		}

		if (this.hasOutroMethod) {
			if (hasOutros) {
				properties.addBlock(deindent`
					o: function outro(${this.alias('outrocallback')}) {
						if (${outroing}) return;
						${outroing} = true;
						${hasIntros && `${introing} = false;`}

						var ${this.alias('outros')} = ${this.outros};

						${this.builders.outro}
					},
				`);
			} else {
				// TODO should this be a helper?
				properties.addBlock(deindent`
					o: function outro(outrocallback) {
						outrocallback();
					},
				`);
			}
		}

		if (this.builders.unmount.isEmpty()) {
			properties.addBlock(`u: @noop,`);
		} else {
			properties.addBlock(deindent`
				u: function unmount() {
					${this.builders.unmount}
				},
			`);
		}

		if (this.builders.destroy.isEmpty()) {
			properties.addBlock(`d: @noop`);
		} else {
			properties.addBlock(deindent`
				d: function destroy() {
					${this.builders.destroy}
				}
			`);
		}

		return deindent`
			${this.comment && `// ${escape(this.comment)}`}
			function ${this.name}(${this.params.join(', ')}, #component${this.key ? `, ${localKey}` : ''}) {
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
