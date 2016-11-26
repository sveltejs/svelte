import parse from './parse/index.js';
import validate from './validate/index.js';
import generate from './generate/index.js';

export function compile ( source, options = {} ) {
	const parsed = parse( source, options );

	if ( !options.onwarn ) {
		options.onwarn = warning => {
			if ( warning.loc ) {
				console.warn( `(${warning.loc.line}:${warning.loc.column}) – ${warning.message}` ); // eslint-disable-line no-console
			} else {
				console.warn( warning.message ); // eslint-disable-line no-console
			}
		};
	}

	validate( parsed, source, options );

	return generate( parsed, source, options );
}

export { parse, validate };
