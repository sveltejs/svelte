import deindent from '../../../utils/deindent.js';

export default function visitMustacheTag ( generator, fragment, state, node ) {
	const name = fragment.getUniqueName( 'text' );

	const { snippet } = generator.contextualise( fragment, node.expression );

	fragment.builders.create.addLine( `var last_${name} = ${snippet};` );
	fragment.addElement( name, `${generator.helper( 'createText' )}( last_${name} )`, state.parentNode, true );

	if ( !fragment.tmp ) fragment.tmp = fragment.getUniqueName( 'tmp' );

	fragment.builders.update.addBlock( deindent`
		if ( ( ${fragment.tmp} = ${snippet} ) !== last_${name} ) {
			${name}.data = last_${name} = ${fragment.tmp};
		}
	` );
}