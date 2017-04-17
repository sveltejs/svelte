import deindent from '../../../utils/deindent.js';

export default function visitRawMustacheTag ( generator, block, state, node ) {
	const name = block.getUniqueName( 'raw' );

	const { snippet } = block.contextualise( node.expression );

	// we would have used comments here, but the `insertAdjacentHTML` api only
	// exists for `Element`s.
	const before = `${name}_before`;
	block.addElement( before, `${generator.helper( 'createElement' )}( 'noscript' )`, state.parentNode, true );

	const after = `${name}_after`;
	block.addElement( after, `${generator.helper( 'createElement' )}( 'noscript' )`, state.parentNode, true );

	const isToplevel = !state.parentNode;

	block.builders.create.addLine( `var last_${name} = ${snippet};` );
	const mountStatement = `${before}.insertAdjacentHTML( 'afterend', last_${name} );`;
	const detachStatement = `${generator.helper( 'detachBetween' )}( ${before}, ${after} );`;

	if ( isToplevel ) {
		block.builders.mount.addLine( mountStatement );
	} else {
		block.builders.create.addLine( mountStatement );
	}

	block.builders.update.addBlock( deindent`
		if ( last_${name} !== ( last_${name} = ${snippet} ) ) {
			${detachStatement}
			${mountStatement}
		}
	` );

	block.builders.detachRaw.addBlock( detachStatement );
}