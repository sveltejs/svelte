export default class Fragment {
	constructor ( options ) {
		Object.assign( this, options );
	}

	addElement ( name, renderStatement, target, needsIdentifier = false ) {
		const isToplevel = !target;
		if ( needsIdentifier || isToplevel ) {
			this.builders.create.addLine(
				`var ${name} = ${renderStatement};`
			);

			this.createMountStatement( name, target );
		} else {
			this.builders.create.addLine( `${this.generator.helper( 'appendNode' )}( ${renderStatement}, ${target} );` );
		}

		if ( isToplevel ) {
			this.builders.detach.addLine( `${this.generator.helper( 'detachNode' )}( ${name} );` );
		}
	}

	child ( options ) {
		return new Fragment( Object.assign( {}, this, options, { parent: this } ) );
	}

	createAnchor ( name, target ) {
		const renderStatement = `${this.generator.helper( 'createComment' )}()`;
		this.addElement( name, renderStatement, target, true );
	}

	createMountStatement ( name, target ) {
		if ( target ) {
			this.builders.create.addLine( `${this.generator.helper( 'appendNode' )}( ${name}, ${target} );` );
		} else {
			this.builders.mount.addLine( `${this.generator.helper( 'insertNode' )}( ${name}, target, anchor );` );
		}
	}
}