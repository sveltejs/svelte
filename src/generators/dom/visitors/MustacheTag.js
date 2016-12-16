import deindent from '../../../utils/deindent.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.getUniqueName( 'text' );

		generator.addSourcemapLocations( node.expression );
		const { snippet } = generator.contextualise( node.expression );

		generator.fire( 'addElement', {
			name,
			renderStatement: `document.createTextNode( ${snippet} )`,
			needsIdentifier: true
		});

		generator.current.builders.update.addBlock( deindent`
			${name}.data = ${snippet};
		` );
	}
};
