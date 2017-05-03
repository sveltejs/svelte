const start = /\n(\t+)/;

export default function deindent ( strings, ...values ) {
	const indentation = start.exec( strings[0] )[1];
	const pattern = new RegExp( `^${indentation}`, 'gm' );

	let result = strings[0].replace( start, '' ).replace( pattern, '' );

	let trailingIndentation = getTrailingIndentation( result );

	for ( let i = 1; i < strings.length; i += 1 ) {
		const expression = values[ i - 1 ];
		const string = strings[i].replace( pattern, '' );

		if ( expression || expression === '' ) {
			const value = String( expression ).replace( /\n/g, `\n${trailingIndentation}` );
			result += value + string;
		}

		else {
			let c = result.length;
			while ( /\s/.test( result[ c - 1 ] ) ) c -= 1;
			result = result.slice( 0, c ) + string;
		}

		trailingIndentation = getTrailingIndentation( result );
	}

	return result.trim().replace( /\t+$/gm, '' );
}

function getTrailingIndentation ( str ) {
	let i = str.length;
	while ( str[ i - 1 ] === ' ' || str[ i - 1 ] === '\t' ) i -= 1;
	return str.slice( i, str.length );
}
