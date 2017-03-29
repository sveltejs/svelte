import deindent from '../../../utils/deindent.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.getUniqueName( 'text' );

		const { snippet } = generator.contextualise( node.expression );

		generator.current.builders.init.addLine( `var last_${name} = ${snippet};` );
		generator.addElement( name, `${generator.helper( 'createText' )}( last_${name} )`, true );

		if ( !generator.current.tmp ) {
			generator.current.tmp = generator.current.getUniqueName( 'tmp' );
		}
		generator.current.builders.update.addBlock( deindent`
			if ( ( ${generator.current.tmp} = ${snippet} ) !== last_${name} ) {
				${name}.data = last_${name} = ${generator.current.tmp};
			}
		` );
	}
};
