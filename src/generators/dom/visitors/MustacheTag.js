import deindent from '../../../utils/deindent.js';

export default function visitMustacheTag ( generator, block, state, node ) {
	const name = block.getUniqueName( 'text' );

	const { snippet } = block.contextualise( node.expression );

	block.builders.create.addLine( `var last_${name} = ${snippet};` );
	block.addElement( name, `${generator.helper( 'createText' )}( last_${name} )`, state.parentNode, true );

	block.builders.update.addBlock( deindent`
		if ( last_${name} !== ( last_${name} = ${snippet} ) ) {
			${name}.data = last_${name};
		}
	` );
}