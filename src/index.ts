import parse from './parse/index';
import validate from './validate/index';
import generate from './generators/dom/index';
import generateSSR from './generators/server-side-rendering/index';
import { assign } from './shared/index.js';
import { version } from '../package.json';
import { Parsed, CompileOptions, Warning } from './interfaces';

function normalizeOptions ( options: CompileOptions ) :CompileOptions {
	return assign({
		generate: 'dom',

		// a filename is necessary for sourcemap generation
		filename: 'SvelteComponent.html',

		onwarn: ( warning: Warning ) => {
			if ( warning.loc ) {
				console.warn( `(${warning.loc.line}:${warning.loc.column}) – ${warning.message}` ); // eslint-disable-line no-console
			} else {
				console.warn( warning.message ); // eslint-disable-line no-console
			}
		},

		onerror: ( error: Error ) => {
			throw error;
		}
	}, options );
}

export function compile ( source: string, _options: CompileOptions ) {
	const options = normalizeOptions( _options );

	let parsed: Parsed;

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

	try {
		return (new Function( 'return ' + compiled.code ))();
	} catch ( err ) {
		if ( _options.onerror ) {
			_options.onerror( err );
			return;
		} else {
			throw err;
		}
	}
}

export { parse, validate, version as VERSION };
