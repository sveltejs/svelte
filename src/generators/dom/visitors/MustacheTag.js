import deindent from '../../../utils/deindent.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.getUniqueName( 'text' );

		generator.addSourcemapLocations( node.expression );
		const { snippet } = generator.contextualise( node.expression );

		generator.current.builders.init.addLine( `var last_${name} = ${snippet}` );
		generator.addElement( name, `createText( last_${name} )`, true );
		generator.uses.createText = true;

		generator.current.builders.update.addBlock( deindent`
			if ( ( __tmp = ${snippet} ) !== last_${name} ) {
				${name}.data = last_${name} = __tmp;
			}
		` );
	}
};
