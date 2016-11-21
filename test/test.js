import { compile } from '../compiler/index.js';
import parse from '../compiler/parse/index.js';
import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import jsdom from 'jsdom';

const cache = {};

require.extensions[ '.html' ] = function ( module, filename ) {
	const code = cache[ filename ];
	if ( !code ) throw new Error( `not compiled: ${filename}` );

	return module._compile( code, filename );
};

function exists ( path ) {
	try {
		fs.statSync( path );
		return true;
	} catch ( err ) {
		return false;
	}
}

describe( 'svelte', () => {
	describe( 'parser', () => {
		fs.readdirSync( 'test/parser' ).forEach( dir => {
			if ( dir[0] === '.' ) return;

			const solo = exists( `test/parser/${dir}/solo` );

			( solo ? it.only : it )( dir, () => {
				const input = fs.readFileSync( `test/parser/${dir}/input.html`, 'utf-8' );

				try {
					const actual = parse( input );
					const expected = require( `./parser/${dir}/output.json` );

					assert.deepEqual( actual, expected );
				} catch ( err ) {
					if ( err.name !== 'ParseError' ) throw err;

					const expected = require( `./parser/${dir}/error.json` );

					assert.equal( err.shortMessage, expected.message );
					assert.deepEqual( err.loc, expected.loc );
					assert.equal( err.pos, expected.pos );
				}
			});
		});
	});

	describe( 'compiler', () => {
		function loadConfig ( dir ) {
			try {
				return require( `./compiler/${dir}/_config.js` ).default;
			} catch ( err ) {
				if ( err.code === 'E_NOT_FOUND' ) {
					return {};
				}

				throw err;
			}
		}

		function env () {
			return new Promise( ( fulfil, reject ) => {
				jsdom.env( '<main></main>', ( err, window ) => {
					if ( err ) {
						reject( err );
					} else {
						global.document = window.document;
						fulfil( window );
					}
				});
			});
		}

		fs.readdirSync( 'test/compiler' ).forEach( dir => {
			if ( dir[0] === '.' ) return;

			const config = loadConfig( dir );

			( config.solo ? it.only : it )( dir, () => {
				let compiled;

				try {
					const source = fs.readFileSync( `test/compiler/${dir}/main.html`, 'utf-8' );
					compiled = compile( source );
				} catch ( err ) {
					if ( config.compileError ) {
						config.compileError( err );
						return;
					} else {
						throw err;
					}
				}

				const { code } = compiled;
				const withLineNumbers = code.split( '\n' ).map( ( line, i ) => {
					i = String( i + 1 );
					while ( i.length < 3 ) i = ` ${i}`;

					return `${i}: ${line.replace( /^\t+/, match => match.split( '\t' ).join( '    ' ) )}`;
				}).join( '\n' );

				cache[ path.resolve( `test/compiler/${dir}/main.html` ) ] = code;

				let SvelteComponent;

				try {
					SvelteComponent = require( `./compiler/${dir}/main.html` ).default;
				} catch ( err ) {
					console.log( withLineNumbers ); // eslint-disable-line no-console
					throw err;
				}

				if ( config.show ) {
					console.log( withLineNumbers ); // eslint-disable-line no-console
				}

				return env()
					.then( window => {
						const target = window.document.querySelector( 'main' );

						const component = new SvelteComponent({
							target,
							data: config.data
						});

						if ( config.html ) {
							assert.equal( target.innerHTML, config.html );
						}

						if ( config.test ) {
							config.test( component, target, window );
						} else {
							component.teardown();
							assert.equal( target.innerHTML, '' );
						}
					})
					.catch( err => {
						if ( !config.show ) console.log( withLineNumbers ); // eslint-disable-line no-console
						throw err;
					});
			});
		});
	});
});
