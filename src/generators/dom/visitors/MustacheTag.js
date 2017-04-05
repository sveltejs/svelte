import deindent from '../../../utils/deindent.js';
import findBlock from '../utils/findBlock.js';

export default function visitMustacheTag ( generator, node ) {
	const name = generator.current.getUniqueName( 'text' );

	const { snippet } = generator.contextualise( node.expression );

	generator.current.builders.init.addLine( `var last_${name} = ${snippet};` );
	generator.addElement( name, `${generator.helper( 'createText' )}( last_${name} )`, true );

	const fragment = findBlock( generator.current );
	if ( !fragment.tmp ) fragment.tmp = fragment.getUniqueName( 'tmp' );

	generator.current.builders.update.addBlock( deindent`
		if ( ( ${fragment.tmp} = ${snippet} ) !== last_${name} ) {
			${name}.data = last_${name} = ${fragment.tmp};
		}
	` );
}