export default {
	enter ( generator, node ) {
		if ( generator.current.namespace && !/\S/.test( node.data ) ) {
			return;
		}

		const name = generator.current.getUniqueName( `text` );
		generator.addElement( name, `createText( ${JSON.stringify( node.data )} )`, false );

		generator.uses.createText = true;
	}
};
