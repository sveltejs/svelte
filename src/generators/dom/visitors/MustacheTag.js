import deindent from '../../../utils/deindent.js';

export default function visitMustacheTag ( generator, block, state, node ) {
	const name = block.getUniqueName( 'text' );
	const value = block.getUniqueName( `${name}_value` );

	const { snippet } = block.contextualise( node.expression );

	block.addVariable( value );
	block.addElement( name, `${generator.helper( 'createText' )}( ${value} = ${snippet} )`, state.parentNode, true );

	block.builders.update.addBlock( deindent`
		if ( ${value} !== ( ${value} = ${snippet} ) ) {
			${name}.data = ${value};
		}
	` );
}