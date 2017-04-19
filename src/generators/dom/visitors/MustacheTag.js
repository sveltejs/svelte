import deindent from '../../../utils/deindent.js';

export default function visitMustacheTag ( generator, block, state, node ) {
	const name = node._state.name;
	const value = block.getUniqueName( `${name}_value` );

	const { snippet } = block.contextualise( node.expression );

	block.builders.create.addLine( `var ${value} = ${snippet};` );
	block.addElement( name, `${generator.helper( 'createText' )}( ${value} )`, state.parentNode, true );

	block.builders.update.addBlock( deindent`
		if ( ${value} !== ( ${value} = ${snippet} ) ) {
			${name}.data = ${value};
		}
	` );
}