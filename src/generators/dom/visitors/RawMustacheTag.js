import deindent from '../../../utils/deindent.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.getUniqueName( 'raw' );

		generator.addSourcemapLocations( node.expression );
		const { snippet } = generator.contextualise( node.expression );

		// we would have used comments here, but the `insertAdjacentHTML` api only
		// exists for `Element`s.
		const before = `${name}_before`;
		generator.addElement( before, `${generator.helper( 'createElement' )}( 'noscript' )`, true );

		const after = `${name}_after`;
		generator.addElement( after, `${generator.helper( 'createElement' )}( 'noscript' )`, true );

		const isToplevel = generator.current.localElementDepth === 0;

		generator.current.builders.init.addLine( `var last_${name} = ${snippet};` );
		const mountStatement = `${before}.insertAdjacentHTML( 'afterend', last_${name} );`;
		const detachStatement = `${generator.helper( 'detachBetween' )}( ${before}, ${after} );`;

		if ( isToplevel ) {
			generator.current.builders.mount.addLine( mountStatement );
		} else {
			generator.current.builders.init.addLine( mountStatement );
		}

		generator.current.builders.update.addBlock( deindent`
			if ( ( __tmp = ${snippet} ) !== last_${name} ) {
				last_${name} = __tmp;
				${detachStatement}
				${mountStatement}
			}
		` );

		generator.current.builders.detachRaw.addBlock( detachStatement );
	}
};
