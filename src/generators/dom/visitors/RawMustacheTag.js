import deindent from '../../../utils/deindent.js';
import findBlock from '../utils/findBlock.js';

export default function visitRawMustacheTag ( generator, fragment, state, node ) {
	const name = fragment.getUniqueName( 'raw' );

	const { snippet } = generator.contextualise( fragment, node.expression );

	// we would have used comments here, but the `insertAdjacentHTML` api only
	// exists for `Element`s.
	const before = `${name}_before`;
	fragment.addElement( before, `${generator.helper( 'createElement' )}( 'noscript' )`, state.parentNode, true );

	const after = `${name}_after`;
	fragment.addElement( after, `${generator.helper( 'createElement' )}( 'noscript' )`, state.parentNode, true );

	const isToplevel = !state.parentNode;

	fragment.builders.create.addLine( `var last_${name} = ${snippet};` );
	const mountStatement = `${before}.insertAdjacentHTML( 'afterend', last_${name} );`;
	const detachStatement = `${generator.helper( 'detachBetween' )}( ${before}, ${after} );`;

	if ( isToplevel ) {
		fragment.builders.mount.addLine( mountStatement );
	} else {
		fragment.builders.create.addLine( mountStatement );
	}

	// TODO this should be unnecessary once we separate fragments from state
	const parentFragment = findBlock( fragment );
	if ( !parentFragment.tmp ) parentFragment.tmp = parentFragment.getUniqueName( 'tmp' );

	fragment.builders.update.addBlock( deindent`
		if ( ( ${parentFragment.tmp} = ${snippet} ) !== last_${name} ) {
			last_${name} = ${parentFragment.tmp};
			${detachStatement}
			${mountStatement}
		}
	` );

	fragment.builders.detachRaw.addBlock( detachStatement );
}