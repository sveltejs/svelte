import parse from './parse/index.js';
import validate from './validate/index.js';
import generate from './generate/index.js';
import generateSSR from './server-side-rendering/compile.js';

function normalizeOptions ( options ) {
	return Object.assign( {
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
		parsed = parse( source );
	} catch ( err ) {
		options.onerror( err );
		return;
	}

	const { names } = validate( parsed, source, options );

	const compiler = options.generate === 'ssr'
		? generateSSR
		: generate;

	return compiler( parsed, source, options, names );
}

export { parse, validate };
