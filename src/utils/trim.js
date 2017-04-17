import { whitespace } from './patterns.js';

export function trimStart ( str ) {
	let i = 0;
	while ( whitespace.test( str[i] ) ) i += 1;

	return str.slice( i );
}

export function trimEnd ( str ) {
	let i = str.length;
	while ( whitespace.test( str[ i - 1 ] ) ) i -= 1;

	return str.slice( 0, i );
}
