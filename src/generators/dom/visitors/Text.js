export default function visitText ( generator, fragment, state, node ) {
	if ( state.namespace && !/\S/.test( node.data ) ) {
		return;
	}

	const name = fragment.getUniqueName( `text` );
	fragment.addElement( name, `${generator.helper( 'createText' )}( ${JSON.stringify( node.data )} )`, state.parentNode, false );
}