import deindent from '../../../utils/deindent.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.getUniqueName( 'raw' );

		generator.addSourcemapLocations( node.expression );
		const { snippet } = generator.contextualise( node.expression );

		// we would have used comments here, but the `insertAdjacentHTML` api only
		// exists for `Element`s.
		const before = `${name}_before`;
		generator.fire( 'addElement', {
			name: before,
			renderStatement: `document.createElement( 'noscript' )`,
			needsIdentifier: true
		});
		
		const after = `${name}_after`;
		generator.fire( 'addElement', {
			name: after,
			renderStatement: `document.createElement( 'noscript' )`,
			needsIdentifier: true
		});

		const isToplevel = generator.current.localElementDepth === 0;

		const mountStatement = `${before}.insertAdjacentHTML( 'afterend', ${snippet} );`;
		const detachStatement = deindent`
			while ( ${before}.nextSibling && ${before}.nextSibling !== ${after} ) {
				${before}.parentNode.removeChild( ${before}.nextSibling );
			}
		`;

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
