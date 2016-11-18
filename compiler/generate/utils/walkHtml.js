export default function walkHtml ( html, visitors ) {
	function visit ( node ) {
		const visitor = visitors[ node.type ];
		if ( !visitor ) throw new Error( `Not implemented: ${node.type}` );

		if ( visitor.enter ) visitor.enter( node );

		if ( node.children ) {
			node.children.forEach( child => {
				visit( child );
			});
		}

		if ( visitor.leave ) visitor.leave( node );
	}

	visit( html );
}
