

export default function visitText ( generator, block, state, node ) {
	if ( !node._state.shouldCreate ) return;
	block.addElement( node._state.name, `${generator.helper( 'createText' )}( ${JSON.stringify( node.data )} )`, state.parentNode, false );
}