import spaces from './spaces.js';

function tabsToSpaces ( str: string ) {
	return str.replace( /^\t+/, match => match.split( '\t' ).join( '  ' ) );
}

export default function getCodeFrame ( source: string, line: number, column: number ) {
	const lines = source.split( '\n' );

	const frameStart = Math.max( 0, line - 2 );
	const frameEnd = Math.min( line + 3, lines.length );

	const digits = String( frameEnd + 1 ).length;

	return lines
		.slice( frameStart, frameEnd )
		.map( ( str, i ) => {
			const isErrorLine = frameStart + i === line;

			let lineNum = String( i + frameStart + 1 );
			while ( lineNum.length < digits ) lineNum = ` ${lineNum}`;

			if ( isErrorLine ) {
				const indicator = spaces( digits + 2 + tabsToSpaces( str.slice( 0, column ) ).length ) + '^';
				return `${lineNum}: ${tabsToSpaces( str )}\n${indicator}`;
			}

			return `${lineNum}: ${tabsToSpaces( str )}`;
		})
		.join( '\n' );
}
