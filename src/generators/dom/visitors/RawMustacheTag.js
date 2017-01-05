export default {
	enter ( generator, node ) {
		const name = generator.current.getUniqueName( 'raw' );

		generator.addSourcemapLocations( node.expression );
		const { snippet } = generator.contextualise( node.expression );

		// we would have used comments here, but the `insertAdjacentHTML` api only
		// exists for `Element`s.
		generator.uses.createElement = true;

		const before = `${name}_before`;
		generator.addElement( before, `createElement( 'noscript' )`, true );

		const after = `${name}_after`;
		generator.addElement( after, `createElement( 'noscript' )`, true );

		const isToplevel = generator.current.localElementDepth === 0;

		const mountStatement = `${before}.insertAdjacentHTML( 'afterend', ${snippet} );`;
		generator.uses.detachBetween = true;
		const detachStatement = `detachBetween( ${before}, ${after} );`;

		if ( isToplevel ) {
			generator.current.builders.mount.addLine( mountStatement );
		} else {
			generator.current.builders.init.addLine( mountStatement );
		}

		generator.current.builders.update.addBlock( detachStatement );
		generator.current.builders.update.addBlock( mountStatement );

		generator.current.builders.detachRaw.addBlock( detachStatement );
	}
};
