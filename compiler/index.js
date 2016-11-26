import parse from './parse/index.js';
import validate from './validate/index.js';
import generate from './generate/index.js';

export function compile ( source, options = {} ) {
	const parsed = parse( source, options );

	const { errors, warnings } = validate( parsed, source, options );

	if ( errors.length ) {
		// TODO optionally show all errors?
		throw errors[0];
	}

	if ( warnings.length ) {
		console.warn( `Svelte: ${warnings.length} ${warnings.length === 1 ? 'error' : 'errors'} in ${options.filename || 'template'}:` );
		warnings.forEach( warning => {
			console.warn( `(${warning.loc.line}:${warning.loc.column}) – ${warning.message}` );
		});
	}

	return generate( parsed, source, options );
}

export { parse, validate };
