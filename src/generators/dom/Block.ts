import CodeBuilder from '../../utils/CodeBuilder';
import deindent from '../../utils/deindent';
import { DomGenerator } from './index';
import { Node } from '../../interfaces';
import shared from './shared';

export interface BlockOptions {
	name: string;
	generator?: DomGenerator;
	expression?: Node;
	context?: string;
	key?: string;
	contexts?: Map<string, string>;
	indexes?: Map<string, string>;
	contextDependencies?: Map<string, string[]>;
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

	key: string;
	first: string;

	contexts: Map<string, string>;
	indexes: Map<string, string>;
	contextDependencies: Map<string, string[]>;
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

		// for keyed each blocks
		this.key = options.key;
		this.first = null;

		this.contexts = options.contexts;
		this.indexes = options.indexes;
		this.contextDependencies = options.contextDependencies;
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
		parentNode: string,
		needsIdentifier = false
	) {
		const isToplevel = !parentNode;

		this.addVariable(name);
		this.builders.create.addLine(`${name} = ${renderStatement};`);
		this.builders.claim.addLine(`${name} = ${claimStatement};`);

		this.mount(name, parentNode);

		if (isToplevel) {
			this.builders.unmount.addLine(`@detachNode( ${name} );`);
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
		return this.generator.contextualise(
			this,
			expression,
			context,
			isEventHandler
		);
	}

	findDependencies(expression: Node) {
		return this.generator.findDependencies(
			this.contextDependencies,
			this.indexes,
			expression
		);
	}

	mount(name: string, parentNode: string) {
		if (parentNode) {
			this.builders.mount.addLine(`@appendNode( ${name}, ${parentNode} );`);
		} else {
			this.builders.mount.addLine(`@insertNode( ${name}, #target, anchor );`);
		}
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
			outroing = this.getUniqueName('outroing');
			this.addVariable(outroing);
		}

		if (this.autofocus) {
			this.builders.mount.addLine(`${this.autofocus}.focus();`);
		}

		// minor hack – we need to ensure that any {{{triples}}} are detached first
		this.builders.unmount.addBlockAtStart(this.builders.detachRaw);

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
			properties.addBlock(`create: @noop,`);
		} else {
			properties.addBlock(deindent`
				create: function () {
					${this.builders.create}
					${!this.builders.hydrate.isEmpty() && `this.hydrate();`}
				},
			`);
		}

		if (this.generator.hydratable) {
			if (this.builders.claim.isEmpty()) {
				properties.addBlock(`claim: @noop,`);
			} else {
				properties.addBlock(deindent`
					claim: function ( nodes ) {
						${this.builders.claim}
						${!this.builders.hydrate.isEmpty() && `this.hydrate();`}
					},
				`);
			}
		}

		if (!this.builders.hydrate.isEmpty()) {
			properties.addBlock(deindent`
				hydrate: function ( nodes ) {
					${this.builders.hydrate}
				},
			`);
		}

		if (this.builders.mount.isEmpty()) {
			properties.addBlock(`mount: @noop,`);
		} else {
			properties.addBlock(deindent`
				mount: function ( #target, anchor ) {
					${this.builders.mount}
				},
			`);
		}

		if (this.hasUpdateMethod) {
			if (this.builders.update.isEmpty()) {
				properties.addBlock(`update: @noop,`);
			} else {
				properties.addBlock(deindent`
					update: function ( changed, ${this.params.join(', ')} ) {
						${this.builders.update}
					},
				`);
			}
		}

		if (this.hasIntroMethod) {
			if (hasIntros) {
				properties.addBlock(deindent`
					intro: function ( #target, anchor ) {
						if ( ${introing} ) return;
						${introing} = true;
						${hasOutros && `${outroing} = false;`}

						${this.builders.intro}

						this.mount( #target, anchor );
					},
				`);
			} else {
				properties.addBlock(deindent`
					intro: function ( #target, anchor ) {
						this.mount( #target, anchor );
					},
				`);
			}
		}

		if (this.hasOutroMethod) {
			if (hasOutros) {
				properties.addBlock(deindent`
					outro: function ( ${this.alias('outrocallback')} ) {
						if ( ${outroing} ) return;
						${outroing} = true;
						${hasIntros && `${introing} = false;`}

						var ${this.alias('outros')} = ${this.outros};

						${this.builders.outro}
					},
				`);
			} else {
				properties.addBlock(deindent`
					outro: function ( outrocallback ) {
						outrocallback();
					},
				`);
			}
		}

		if (this.builders.unmount.isEmpty()) {
			properties.addBlock(`unmount: @noop,`);
		} else {
			properties.addBlock(deindent`
				unmount: function () {
					${this.builders.unmount}
				},
			`);
		}

		if (this.builders.destroy.isEmpty()) {
			properties.addBlock(`destroy: @noop`);
		} else {
			properties.addBlock(deindent`
				destroy: function () {
					${this.builders.destroy}
				}
			`);
		}

		return deindent`
			function ${this.name} ( ${this.params.join(', ')}, #component${this.key
			? `, ${localKey}`
			: ''} ) {
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
		`.replace(/(\\\\)?#(\w*)/g, (match, escaped, name) => {
			return escaped ? match.slice(2) : this.alias(name);
		});
	}
}
