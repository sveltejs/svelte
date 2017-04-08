export default class Fragment {
	constructor ({ generator, name, key, expression, context, contextDependencies, component, contexts, indexes, params, indexNames, listNames, builders, getUniqueName }) {
		this.generator = generator;
		this.name = name;
		this.key = key;
		this.expression = expression;
		this.context = context;

		this.component = component;

		this.contexts = contexts;
		this.indexes = indexes;
		this.contextDependencies = contextDependencies;

		this.params = params;
		this.indexNames = indexNames;
		this.listNames = listNames;

		this.builders = builders;
		this.getUniqueName = getUniqueName;
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
		return new Fragment( Object.assign( {}, this, options, { parent: this } ) );
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
}