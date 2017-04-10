export default function visitText ( generator, block, state, node ) {
	if ( state.namespace && !/\S/.test( node.data ) ) {
		return;
	}

	const name = block.getUniqueName( `text` );
	block.addElement( name, `${generator.helper( 'createText' )}( ${JSON.stringify( node.data )} )`, state.parentNode, false );
}