export default class Fragment {
	constructor ( options ) {
		Object.assign( this, options );
	}

	addElement ( name, renderStatement, needsIdentifier = false ) {
		const isToplevel = this.localElementDepth === 0;
		if ( needsIdentifier || isToplevel ) {
			this.builders.create.addLine(
				`var ${name} = ${renderStatement};`
			);

			this.createMountStatement( name );
		} else {
			this.builders.create.addLine( `${this.generator.helper( 'appendNode' )}( ${renderStatement}, ${this.target} );` );
		}

		if ( isToplevel ) {
			this.builders.detach.addLine( `${this.generator.helper( 'detachNode' )}( ${name} );` );
		}
	}

	child ( options ) {
		return new Fragment( Object.assign( {}, this, options, { parent: this } ) );
	}

	createAnchor ( name ) {
		const renderStatement = `${this.generator.helper( 'createComment' )}()`;
		this.addElement( name, renderStatement, true );
	}

	createMountStatement ( name ) {
		if ( this.target === 'target' ) {
			this.builders.mount.addLine( `${this.generator.helper( 'insertNode' )}( ${name}, target, anchor );` );
		} else {
			this.builders.create.addLine( `${this.generator.helper( 'appendNode' )}( ${name}, ${this.target} );` );
		}
	}
}