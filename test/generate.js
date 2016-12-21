import spaces from '../src/utils/spaces.js';
import assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as acorn from 'acorn';

import { svelte, env, setupHtmlEqual } from './helpers.js';

let showCompiledCode = false;
let compileOptions = null;

require.extensions[ '.html' ] = function ( module, filename ) {
	const options = Object.assign({ filename }, compileOptions );
	const { code } = svelte.compile( fs.readFileSync( filename, 'utf-8' ), options );

	if ( showCompiledCode ) console.log( addLineNumbers( code ) ); // eslint-disable-line no-console

	return module._compile( code, filename );
};

function addLineNumbers ( code ) {
	return code.split( '\n' ).map( ( line, i ) => {
		i = String( i + 1 );
		while ( i.length < 3 ) i = ` ${i}`;

		return `${i}: ${line.replace( /^\t+/, match => match.split( '\t' ).join( '    ' ) )}`;
	}).join( '\n' );
}

function loadConfig ( dir ) {
	try {
		const resolved = require.resolve( `./generator/${dir}/_config.js` );
		delete require.cache[ resolved ];
		return require( resolved ).default;
	} catch ( err ) {
		if ( err.code === 'E_NOT_FOUND' ) {
			return {};
		}

		throw err;
	}
}

describe( 'generate', () => {
	before( setupHtmlEqual );

	function runTest ( dir, shared ) {
		if ( dir[0] === '.' ) return;

		const config = loadConfig( dir );

		( config.skip ? it.skip : config.solo ? it.only : it )( dir, () => {
			let compiled;

			showCompiledCode = config.show;
			compileOptions = config.compileOptions || {};
			compileOptions.shared = shared;

			try {
				const source = fs.readFileSync( `test/generator/${dir}/main.html`, 'utf-8' );
				compiled = svelte.compile( source );
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
			try {
				const startIndex = code.indexOf( 'function renderMainFragment' ); // may change!
				const es5 = spaces( startIndex ) + code.slice( startIndex ).replace( /export default .+/, '' );
				acorn.parse( es5, { ecmaVersion: 5 });
			} catch ( err ) {
				if ( !config.show ) console.log( addLineNumbers( code ) ); // eslint-disable-line no-console
				throw err;
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

			return env()
				.then( window => {
					// Put the constructor on window for testing
					window.SvelteComponent = SvelteComponent;

					const target = window.document.querySelector( 'main' );

					const component = new SvelteComponent({
						target,
						data: config.data
					});

					if ( config.html ) {
						assert.htmlEqual( target.innerHTML, config.html );
					}

					if ( config.test ) {
						config.test( assert, component, target, window );
					} else {
						component.teardown();
						assert.equal( target.innerHTML, '' );
					}
				})
				.catch( err => {
					if ( !config.show ) console.log( addLineNumbers( code ) ); // eslint-disable-line no-console
					throw err;
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
});
