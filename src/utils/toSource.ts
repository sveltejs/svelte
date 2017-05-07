import deindent from './deindent.js';

export default function toSource ( thing: any ) :string {
	if ( typeof thing === 'function' ) {
		return normaliseIndentation( thing.toString() );
	}

	if ( Array.isArray( thing ) ) {
		if ( thing.length === 0 ) return '[]';
		throw new Error( 'TODO' ); // not currently needed
	}

	if ( thing && typeof thing === 'object' ) {
		const keys = Object.keys( thing );
		if ( keys.length === 0 ) return '{}';

		const props = keys.map( key => `${key}: ${toSource( thing[ key ] )}` ).join( ',\n' );
		return deindent`
			{
				${props}
			}
		`;
	}

	return JSON.stringify( thing );
}

function normaliseIndentation ( str: string ) {
	const lines = str.split( '\n' ).slice( 1, -1 );
	let minIndentation = Infinity;

	lines.forEach( line => {
		if ( !/\S/.test( line ) ) return;
		const indentation = /^\t*/.exec( line )[0].length;
		if ( indentation < minIndentation ) minIndentation = indentation;
	});

	if ( minIndentation !== Infinity && minIndentation !== 1 ) {
		const pattern = new RegExp( `^\\t{${minIndentation - 1}}`, 'gm' );
		return str.replace( pattern, '' );
	}

	return str;
}