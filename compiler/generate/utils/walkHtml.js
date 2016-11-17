export default function walkHtml ( html, { enter, leave } ) {
	function visit ( node ) {
		enter( node );

		if ( node.children ) {
			node.children.forEach( child => {
				visit( child );
			});
		}

		leave( node );
	}

	visit( html );
}
