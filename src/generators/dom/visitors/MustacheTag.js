import deindent from '../../../utils/deindent.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.getUniqueName( 'text' );

		generator.addSourcemapLocations( node.expression );
		const { snippet } = generator.contextualise( node.expression );

		generator.uses.createText = true;
		generator.addElement( name, `createText( ${snippet} )`, true );
		generator.current.builders.init.addLine(`var last_${name} = ${snippet}`);

		generator.current.builders.update.addBlock( deindent`
			if (${snippet} !== last_${name}) {
				${name}.data = last_${name} = ${snippet};
			}
		` );
	}
};
