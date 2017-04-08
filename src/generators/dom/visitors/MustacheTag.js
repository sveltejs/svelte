import deindent from '../../../utils/deindent.js';
import findBlock from '../utils/findBlock.js';

export default function visitMustacheTag ( generator, fragment, state, node ) {
	const name = fragment.getUniqueName( 'text' );

	const { snippet } = generator.contextualise( fragment, node.expression );

	fragment.builders.create.addLine( `var last_${name} = ${snippet};` );
	fragment.addElement( name, `${generator.helper( 'createText' )}( last_${name} )`, state.target, true );

	// TODO this should be unnecessary once we separate fragments from state
	const parentFragment = findBlock( fragment );
	if ( !parentFragment.tmp ) parentFragment.tmp = parentFragment.getUniqueName( 'tmp' );

	fragment.builders.update.addBlock( deindent`
		if ( ( ${parentFragment.tmp} = ${snippet} ) !== last_${name} ) {
			${name}.data = last_${name} = ${parentFragment.tmp};
		}
	` );
}