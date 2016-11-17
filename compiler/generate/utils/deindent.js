const start = /\n(\t+)/;

export default function deindent ( strings, ...values ) {
	const indentation = start.exec( strings[0] )[1];
	const pattern = new RegExp( `^${indentation}`, 'gm' );

	let result = strings[0].replace( start, '' ).replace( pattern, '' );

	let trailingIndentation = getTrailingIndentation( result );

	for ( let i = 1; i < strings.length; i += 1 ) {
		const value  = String( values[ i - 1 ] ).replace( /\n/g, `\n${trailingIndentation}` );
		result += value + strings[i].replace( pattern, '' );

		trailingIndentation = getTrailingIndentation( result );
	}

	return result.trim();
}

function getTrailingIndentation ( str ) {
	let i = str.length;
	while ( str[ i - 1 ] === ' ' || str[ i - 1 ] === '\t' ) i -= 1;
	return str.slice( i, str.length );
}
