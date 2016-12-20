import deindent from '../../../utils/deindent.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.getUniqueName( 'text' );

		generator.addSourcemapLocations( node.expression );
		const { snippet } = generator.contextualise( node.expression );

		generator.uses.createText = true;
		generator.addElement( name, `createText( ${snippet} )`, true );

		generator.current.builders.update.addBlock( deindent`
			${name}.data = ${snippet};
		` );
	}
};
