import { whitespace } from './patterns.ts';

export function trimStart ( str: string ) {
	let i = 0;
	while ( whitespace.test( str[i] ) ) i += 1;

	return str.slice( i );
}

export function trimEnd ( str: string ) {
	let i = str.length;
	while ( whitespace.test( str[ i - 1 ] ) ) i -= 1;

	return str.slice( 0, i );
}
