export function appendNode ( node, target ) {
	target.appendChild( node );
}

export function insertNode ( node, target, anchor ) {
	target.insertBefore( node, anchor );
}

export function detachNode ( node ) {
	node.parentNode.removeChild( node );
}

export function detachBetween ( before, after ) {
	while ( before.nextSibling && before.nextSibling !== after ) {
		before.parentNode.removeChild( before.nextSibling );
	}
}

export function teardownEach ( iterations, detach, start ) {
	for ( var i = ( start || 0 ); i < iterations.length; i += 1 ) {
		iterations[i].teardown( detach );
	}
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

export function createComment () {
	return document.createComment( '' );
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

export function setXlinkAttribute ( node, attribute, value ) {
	node.setAttributeNS( 'http://www.w3.org/1999/xlink', attribute, value );
}
