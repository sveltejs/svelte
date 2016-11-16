import parse from './parse/index.js';
import generate from './generate/index.js';

export function compile ( template ) {
	const parsed = parse( template );
	const generated = generate( parsed );

	return generated;
}
