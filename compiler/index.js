import parse from './parse/index.js';
import generate from './generate/index.js';

export function compile ( template, options = {} ) {
	const parsed = parse( template, options );
	// TODO validate template
	const generated = generate( parsed, template, options );

	return generated;
}

export { parse };
