import deindent from '../../utils/deindent.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.getUniqueName( 'raw' );

		generator.addSourcemapLocations( node.expression );
		const { snippet } = generator.contextualise( node.expression );

		// we would have used comments here, but the `insertAdjacentHTML` api only
		// exists for `Element`s.
		const before = `${name}_before`;
		generator.addElement( before, `document.createElement( 'noscript' )`, true );
		const after = `${name}_after`;
		generator.addElement( after, `document.createElement( 'noscript' )`, true );

		const isToplevel = generator.current.localElementDepth === 0;

		const mountStatement = `${before}.insertAdjacentHTML( 'afterend', ${snippet} );`;
		const detachStatement = deindent`
			while ( ${before}.nextSibling && ${before}.nextSibling !== ${after} ) {
				${before}.parentNode.removeChild( ${before}.nextSibling );
			}
		`;

		if ( isToplevel ) {
			generator.current.mountStatements.push(mountStatement);
		} else {
			generator.current.builders.init.addLine( mountStatement );
		}

		generator.current.updateStatements.push( deindent`
			${detachStatement}
			${mountStatement}
		` );

		if ( isToplevel ) {
			const { detachStatements } = generator.current;
			// we need `before` and `after` to still be in the DOM when running the
			// detach code, so splice in the detach code *before* detaching
			// `before`/`after`.
			detachStatements.splice( detachStatements.length - 2, 0, detachStatement);
		}
	}
};
