import parse from './parse/index.js';
import validate from './validate/index.js';
import generate from './generators/dom/index.js';
import generateSSR from './generators/server-side-rendering/index.js';
import { assign } from './shared/index.js';
import { version } from '../package.json';

function normalizeOptions ( options ) {
	return assign( {
		generate: 'dom',

		// a filename is necessary for sourcemap generation
		filename: 'SvelteComponent.html',

		onwarn: warning => {
			if ( warning.loc ) {
				console.warn( `(${warning.loc.line}:${warning.loc.column}) – ${warning.message}` ); // eslint-disable-line no-console
			} else {
				console.warn( warning.message ); // eslint-disable-line no-console
			}
		},

		onerror: error => {
			throw error;
		}
	}, options );
}

export function compile ( source, _options ) {
	const options = normalizeOptions( _options );

	let parsed;

	try {
		parsed = parse( source, options );
	} catch ( err ) {
		options.onerror( err );
		return;
	}

	validate( parsed, source, options );

	const compiler = options.generate === 'ssr'
		? generateSSR
		: generate;

	return compiler( parsed, source, options );
}

export function create ( source, _options = {} ) {
	_options.format = 'eval';

	const compiled = compile( source, _options );

	if ( !compiled || !compiled.code ) {
		return;
	}

	let result;
	try {
		result = (new Function( 'return ' + compiled.code ))();
	} catch ( err ) {
		if ( _options.onerror ) {
			_options.onerror( err );
		} else {
			throw err;
		}
		return;
	}

	return result;
}

export { parse, validate, version as VERSION };
