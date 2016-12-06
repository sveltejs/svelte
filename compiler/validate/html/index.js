export default function validateHtml ( validator, html ) {
	function visit ( node ) {
		if ( node.type === 'EachBlock' ) {
			if ( !~validator.names.indexOf( node.context ) ) validator.names.push( node.context );
			if ( node.index && !~validator.names.indexOf( node.index ) ) validator.names.push( node.index );
		}

		if ( node.children ) {
			node.children.forEach( visit );
		}
	}

	html.children.forEach( visit );
}
