// Whitespace inside one of these elements will not result in
// a whitespace node being created in any circumstances. (This
// list is almost certainly very incomplete)
const elementsWithoutText = new Set([
	'audio',
	'datalist',
	'dl',
	'ol',
	'optgroup',
	'select',
	'ul',
	'video'
]);

export default function visitText ( generator, block, state, node ) {
	if ( !/\S/.test( node.data ) ) {
		if ( state.namespace ) return;
		if ( elementsWithoutText.has( state.parentNodeName) ) return;
	}

	const name = block.getUniqueName( `text` );
	block.addElement( name, `${generator.helper( 'createText' )}( ${JSON.stringify( node.data )} )`, state.parentNode, false );
}