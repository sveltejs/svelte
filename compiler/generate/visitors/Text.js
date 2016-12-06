export default {
	enter ( generator, node ) {
		const name = generator.current.getUniqueName( `text` );
		generator.addElement( name, `document.createTextNode( ${JSON.stringify( node.data )} )` );
	}
};
