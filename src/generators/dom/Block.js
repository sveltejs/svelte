import CodeBuilder from '../../utils/CodeBuilder.js';
import deindent from '../../utils/deindent.js';

export default class Block {
	constructor ({ generator, name, key, expression, context, contextDependencies, contexts, indexes, params, indexNames, listNames }) {
		this.generator = generator;
		this.name = name;
		this.key = key;
		this.expression = expression;
		this.context = context;

		this.contexts = contexts;
		this.indexes = indexes;
		this.contextDependencies = contextDependencies;

		this.params = params;
		this.indexNames = indexNames;
		this.listNames = listNames;

		this.builders = {
			create: new CodeBuilder(),
			mount: new CodeBuilder(),
			update: new CodeBuilder(),
			detach: new CodeBuilder(),
			detachRaw: new CodeBuilder(),
			destroy: new CodeBuilder()
		};

		this.getUniqueName = generator.getUniqueNameMaker( params );

		// unique names
		this.component = this.getUniqueName( 'component' );
	}

	addElement ( name, renderStatement, parentNode, needsIdentifier = false ) {
		const isToplevel = !parentNode;
		if ( needsIdentifier || isToplevel ) {
			this.builders.create.addLine(
				`var ${name} = ${renderStatement};`
			);

			this.createMountStatement( name, parentNode );
		} else {
			this.builders.create.addLine( `${this.generator.helper( 'appendNode' )}( ${renderStatement}, ${parentNode} );` );
		}

		if ( isToplevel ) {
			this.builders.detach.addLine( `${this.generator.helper( 'detachNode' )}( ${name} );` );
		}
	}

	child ( options ) {
		return new Block( Object.assign( {}, this, options, { parent: this } ) );
	}

	createAnchor ( name, parentNode ) {
		const renderStatement = `${this.generator.helper( 'createComment' )}()`;
		this.addElement( name, renderStatement, parentNode, true );
	}

	createMountStatement ( name, parentNode ) {
		if ( parentNode ) {
			this.builders.create.addLine( `${this.generator.helper( 'appendNode' )}( ${name}, ${parentNode} );` );
		} else {
			this.builders.mount.addLine( `${this.generator.helper( 'insertNode' )}( ${name}, target, anchor );` );
		}
	}

	render () {
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
				mount: function ( target, anchor ) {
					${this.builders.mount}
				},
			` );
		}

		if ( this.builders.update.isEmpty() ) {
			properties.addBlock( `update: ${this.generator.helper( 'noop' )},` );
		} else {
			properties.addBlock( deindent`
				update: function ( changed, ${this.params.join( ', ' )} ) {
					${this.tmp ? `var ${this.tmp};` : ''}

					${this.builders.update}
				},
			` );
		}

		if ( this.builders.destroy.isEmpty() ) {
			properties.addBlock( `destroy: ${this.generator.helper( 'noop' )},` );
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