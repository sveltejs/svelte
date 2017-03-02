import spaces from '../src/utils/spaces.js';
import assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as acorn from 'acorn';

import { addLineNumbers, loadConfig, svelte, env, setupHtmlEqual } from './helpers.js';

let showCompiledCode = false;
let compileOptions = null;

function getName ( filename ) {
	const base = path.basename( filename ).replace( '.html', '' );
	return base[0].toUpperCase() + base.slice( 1 );
}

require.extensions[ '.html' ] = function ( module, filename ) {
	const options = Object.assign({ filename, name: getName( filename ) }, compileOptions );
	const { code } = svelte.compile( fs.readFileSync( filename, 'utf-8' ), options );

	if ( showCompiledCode ) console.log( addLineNumbers( code ) ); // eslint-disable-line no-console

	return module._compile( code, filename );
};

describe( 'generate', () => {
	before( setupHtmlEqual );

	function runTest ( dir, shared ) {
		if ( dir[0] === '.' ) return;

		const config = loadConfig( `./generator/${dir}/_config.js` );

		if ( config.solo && process.env.CI ) {
			throw new Error( 'Forgot to remove `solo: true` from test' );
		}

		( config.skip ? it.skip : config.solo ? it.only : it )( dir, () => {
			let compiled;

			showCompiledCode = config.show;
			compileOptions = config.compileOptions || {};
			compileOptions.shared = shared;
			compileOptions.dev = config.dev;

			try {
				const source = fs.readFileSync( `test/generator/${dir}/main.html`, 'utf-8' );
				compiled = svelte.compile( source, compileOptions );
			} catch ( err ) {
				if ( config.compileError ) {
					config.compileError( err );
					return;
				} else {
					throw err;
				}
			}

			const { code } = compiled;

			// check that no ES2015+ syntax slipped in
			if ( !config.allowES2015 ) {
				try {
					const startIndex = code.indexOf( 'function renderMainFragment' ); // may change!
					const es5 = spaces( startIndex ) + code.slice( startIndex ).replace( /export default .+/, '' );
					acorn.parse( es5, { ecmaVersion: 5 });
				} catch ( err ) {
					if ( !config.show ) console.log( addLineNumbers( code ) ); // eslint-disable-line no-console
					throw err;
				}
			}

			Object.keys( require.cache ).filter( x => x.endsWith( '.html' ) ).forEach( file => {
				delete require.cache[ file ];
			});

			let SvelteComponent;

			try {
				SvelteComponent = require( `./generator/${dir}/main.html` ).default;
			} catch ( err ) {
				if ( !config.show ) console.log( addLineNumbers( code ) ); // eslint-disable-line no-console
				throw err;
			}

			let unintendedError = null;

			return env()
				.then( window => {
					// Put the constructor on window for testing
					window.SvelteComponent = SvelteComponent;

					const target = window.document.querySelector( 'main' );

					const component = new SvelteComponent({
						target,
						data: config.data
					});

					if ( config.error ) {
						unintendedError = true;
						throw new Error( 'Expected a runtime error' );
					}

					if ( config.html ) {
						assert.htmlEqual( target.innerHTML, config.html );
					}

					if ( config.test ) {
						config.test( assert, component, target, window );
					} else {
						component.destroy();
						assert.equal( target.innerHTML, '' );
					}
				})
				.catch( err => {
					if ( config.error && !unintendedError ) {
						config.error( assert, err );
					}

					else {
						if ( !config.show ) console.log( addLineNumbers( code ) ); // eslint-disable-line no-console
						throw err;
					}
				});
		});
	}

	describe( 'inline helpers', () => {
		fs.readdirSync( 'test/generator' ).forEach( dir => {
			runTest( dir, null );
		});
	});

	describe( 'shared helpers', () => {
		fs.readdirSync( 'test/generator' ).forEach( dir => {
			runTest( dir, path.resolve( 'shared.js' ) );
		});
	});

	it( 'fails if options.target is missing in dev mode', () => {
		const { code } = svelte.compile( `<div></div>`, {
			format: 'iife',
			name: 'SvelteComponent',
			dev: true
		});

		const SvelteComponent = eval( `(function () { ${code}; return SvelteComponent; }())` );

		assert.throws( () => {
			new SvelteComponent();
		}, /'target' is a required option/ );
	});
});
