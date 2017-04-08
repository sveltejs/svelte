import deindent from '../../../utils/deindent.js';

export default function visitMustacheTag ( generator, block, state, node ) {
	const name = block.getUniqueName( 'text' );

	const { snippet } = generator.contextualise( block, node.expression );

	block.builders.create.addLine( `var last_${name} = ${snippet};` );
	block.addElement( name, `${generator.helper( 'createText' )}( last_${name} )`, state.parentNode, true );

	if ( !block.tmp ) block.tmp = block.getUniqueName( 'tmp' );

	block.builders.update.addBlock( deindent`
		if ( ( ${block.tmp} = ${snippet} ) !== last_${name} ) {
			${name}.data = last_${name} = ${block.tmp};
		}
	` );
}