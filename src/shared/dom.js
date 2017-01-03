export function appendNode ( node, target ) {
	target.appendChild( node );
}

export function insertNode ( node, target, anchor ) {
	target.insertBefore( node, anchor );
}

export function detachNode ( node ) {
	node.parentNode.removeChild( node );
}

export function createElement ( name ) {
	return document.createElement( name );
}

export function createSvgElement ( name ) {
	return document.createElementNS( 'http://www.w3.org/2000/svg', name );
}

export function createText ( data ) {
	return document.createTextNode( data );
}

export function createComment ( data ) {
	return document.createComment( data );
}

export function addEventListener ( node, event, handler ) {
	node.addEventListener ( event, handler, false );
}

export function removeEventListener ( node, event, handler ) {
	node.removeEventListener ( event, handler, false );
}

export function setAttribute ( node, attribute, value ) {
	node.setAttribute ( attribute, value );
}
