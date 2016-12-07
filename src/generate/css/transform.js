// largely borrowed from Ractive – https://github.com/ractivejs/ractive/blob/2ec648aaf5296bb88c21812e947e0e42fcc456e3/src/Ractive/config/custom/css/transform.js
const selectorsPattern = /(?:^|\})?\s*([^\{\}]+)\s*\{/g;
const commentsPattern = /\/\*.*?\*\//g;
const selectorUnitPattern = /((?:(?:\[[^\]+]\])|(?:[^\s\+\>~:]))+)((?:::?[^\s\+\>\~\(:]+(?:\([^\)]+\))?)*\s*[\s\+\>\~]?)\s*/g;
const excludePattern = /^(?:@|\d+%)/;

function transformSelector ( selector, parent ) {
	const selectorUnits = [];
	let match;

	while ( match = selectorUnitPattern.exec( selector ) ) {
		selectorUnits.push({
			str: match[0],
			base: match[1],
			modifiers: match[2]
		});
	}

	// For each simple selector within the selector, we need to create a version
	// that a) combines with the id, and b) is inside the id
	const base = selectorUnits.map( unit => unit.str );

	const transformed = [];
	let i = selectorUnits.length;

	while ( i-- ) {
		const appended = base.slice();

		// Pseudo-selectors should go after the attribute selector
		const unit = selectorUnits[i];
		appended[i] = unit.base + parent + unit.modifiers || '';

		const prepended = base.slice();
		prepended[i] = parent + ' ' + prepended[i];

		transformed.push( appended.join( ' ' ), prepended.join( ' ' ) );
	}

	return transformed.join( ', ' );
}

export default function transformCss ( css, hash ) {
	const attr = `[svelte-${hash}]`;

	return css
		.replace( commentsPattern, '' )
		.replace( selectorsPattern, ( match, $1 ) => {
			// don't transform at-rules and keyframe declarations
			if ( excludePattern.test( $1 ) ) return match;

			const selectors = $1.split( ',' ).map( selector => selector.trim() );
			const transformed = selectors
				.map( selector => transformSelector( selector, attr ) )
				.join( ', ' ) + ' ';

			return match.replace( $1, transformed );
		});
}
