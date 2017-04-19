import CodeBuilder from '../../utils/CodeBuilder.js';
import deindent from '../../utils/deindent.js';

export default class Block {
	constructor ( options ) {
		this.generator = options.generator;
		this.name = options.name;
		this.key = options.key;
		this.expression = options.expression;
		this.context = options.context;

		this.contexts = options.contexts;
		this.indexes = options.indexes;
		this.contextDependencies = options.contextDependencies;
		this.dependencies = new Set();

		this.params = options.params;
		this.indexNames = options.indexNames;
		this.listNames = options.listNames;

		this.listName = options.listName;

		this.builders = {
			create: new CodeBuilder(),
			mount: new CodeBuilder(),
			update: new CodeBuilder(),
			detach: new CodeBuilder(),
			detachRaw: new CodeBuilder(),
			destroy: new CodeBuilder()
		};

		this.aliases = new Map();
		this.variables = new Map();
		this.getUniqueName = this.generator.getUniqueNameMaker( options.params );

		// unique names
		this.component = this.getUniqueName( 'component' );
		this.target = this.getUniqueName( 'target' );

		this.hasUpdateMethod = false; // determined later
	}

	addDependencies ( dependencies ) {
		dependencies.forEach( dependency => {
			this.dependencies.add( dependency );
		});
	}

	addElement ( name, renderStatement, parentNode, needsIdentifier = false ) {
		const isToplevel = !parentNode;
		if ( needsIdentifier || isToplevel ) {
			this.builders.create.addLine(
				`var ${name} = ${renderStatement};`
			);

			this.mount( name, parentNode );
		} else {
			this.builders.create.addLine( `${this.generator.helper( 'appendNode' )}( ${renderStatement}, ${parentNode} );` );
		}

		if ( isToplevel ) {
			this.builders.detach.addLine( `${this.generator.helper( 'detachNode' )}( ${name} );` );
		}
	}

	addVariable ( name, init ) {
		if ( this.variables.has( name ) && this.variables.get( name ) !== init ) {
			throw new Error( `Variable '${name}' already initialised with a different value` );
		}

		this.variables.set( name, init );
	}

	alias ( name ) {
		if ( !this.aliases.has( name ) ) {
			this.aliases.set( name, this.getUniqueName( name ) );
		}

		return this.aliases.get( name );
	}

	child ( options ) {
		return new Block( Object.assign( {}, this, options, { parent: this } ) );
	}

	contextualise ( expression, context, isEventHandler ) {
		return this.generator.contextualise( this, expression, context, isEventHandler );
	}

	findDependencies ( expression ) {
		return this.generator.findDependencies( this.contextDependencies, this.indexes, expression );
	}

	mount ( name, parentNode ) {
		if ( parentNode ) {
			this.builders.create.addLine( `${this.generator.helper( 'appendNode' )}( ${name}, ${parentNode} );` );
		} else {
			this.builders.mount.addLine( `${this.generator.helper( 'insertNode' )}( ${name}, ${this.target}, anchor );` );
		}
	}

	render () {
		if ( this.variables.size ) {
			const variables = Array.from( this.variables.keys() )
				.map( key => {
					const init = this.variables.get( key );
					return init !== undefined ? `${key} = ${init}` : key;
				})
				.join( ', ' );

			this.builders.create.addBlockAtStart( `var ${variables};` );
		}

		if ( this.autofocus ) {
			this.builders.create.addLine( `${this.autofocus}.focus();` );
		}

		// minor hack – we need to ensure that any {{{triples}}} are detached
		// first, so we append normal detach statements to detachRaw
		this.builders.detachRaw.addBlock( this.builders.detach );

		if ( !this.builders.detachRaw.isEmpty() ) {
			this.builders.destroy.addBlock( deindent`
				if ( detach ) {
					${this.builders.detachRaw}
				}
			` );
		}

		const properties = new CodeBuilder();

		let localKey;
		if ( this.key ) {
			localKey = this.getUniqueName( 'key' );
			properties.addBlock( `key: ${localKey},` );
		}

		if ( this.builders.mount.isEmpty() ) {
			properties.addBlock( `mount: ${this.generator.helper( 'noop' )},` );
		} else {
			properties.addBlock( deindent`
				mount: function ( ${this.target}, anchor ) {
					${this.builders.mount}
				},
			` );
		}

		if ( this.hasUpdateMethod ) {
			if ( this.builders.update.isEmpty() ) {
				properties.addBlock( `update: ${this.generator.helper( 'noop' )},` );
			} else {
				properties.addBlock( deindent`
					update: function ( changed, ${this.params.join( ', ' )} ) {
						${this.builders.update}
					},
				` );
			}
		}

		if ( this.builders.destroy.isEmpty() ) {
			properties.addBlock( `destroy: ${this.generator.helper( 'noop' )}` );
		} else {
			properties.addBlock( deindent`
				destroy: function ( detach ) {
					${this.builders.destroy}
				}
			` );
		}

		return deindent`
			function ${this.name} ( ${this.params.join( ', ' )}, ${this.component}${this.key ? `, ${localKey}` : ''} ) {
				${this.builders.create}

				return {
					${properties}
				};
			}
		`;
	}
}