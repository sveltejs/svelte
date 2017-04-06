export default function visitText ( generator, fragment, node ) {
	if ( fragment.namespace && !/\S/.test( node.data ) ) {
		return;
	}

	const name = fragment.getUniqueName( `text` );
	fragment.addElement( name, `${generator.helper( 'createText' )}( ${JSON.stringify( node.data )} )`, false );
}