export default function visitText ( generator, node ) {
	if ( generator.current.namespace && !/\S/.test( node.data ) ) {
		return;
	}

	const name = generator.current.getUniqueName( `text` );
	generator.addElement( name, `${generator.helper( 'createText' )}( ${JSON.stringify( node.data )} )`, false );
}