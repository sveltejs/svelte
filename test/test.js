import { compile } from '../compiler/index.js';
import parse from '../compiler/parse/index.js';
import assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import jsdom from 'jsdom';

import { install } from 'console-group';
install();

const cache = {};

require.extensions[ '.html' ] = function ( module, filename ) {
	const code = cache[ filename ] || ( cache[ filename ] = compile( fs.readFileSync( filename, 'utf-8' ) ).code );
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

					assert.deepEqual( actual.html, expected.html );
					assert.deepEqual( actual.css, expected.css );
					assert.deepEqual( actual.js, expected.js );
				} catch ( err ) {
					if ( err.name !== 'ParseError' ) throw err;

					try {
						const expected = require( `./parser/${dir}/error.json` );

						assert.equal( err.shortMessage, expected.message );
						assert.deepEqual( err.loc, expected.loc );
						assert.equal( err.pos, expected.pos );
					} catch ( err2 ) {
						throw err2.code === 'MODULE_NOT_FOUND' ? err : err2;
					}
				}
			});
		});
	});

	describe( 'compiler', () => {
		before( () => {
			function cleanChildren ( node ) {
				let previous = null;

				[ ...node.childNodes ].forEach( child => {
					if ( child.nodeType === 8 ) {
						// comment
						node.removeChild( child );
						return;
					}

					if ( child.nodeType === 3 ) {
						child.data = child.data.replace( /\s{2,}/, '\n' );

						// text
						if ( previous && previous.nodeType === 3 ) {
							previous.data += child.data;
							previous.data = previous.data.replace( /\s{2,}/, '\n' );

							node.removeChild( child );
						}
					}

					else {
						cleanChildren( child );
					}

					previous = child;
				});

				// collapse whitespace
				if ( node.firstChild && node.firstChild.nodeType === 3 ) {
					node.firstChild.data = node.firstChild.data.replace( /^\s+/, '' );
					if ( !node.firstChild.data ) node.removeChild( node.firstChild );
				}

				if ( node.lastChild && node.lastChild.nodeType === 3 ) {
					node.lastChild.data = node.lastChild.data.replace( /\s+$/, '' );
					if ( !node.lastChild.data ) node.removeChild( node.lastChild );
				}
			}

			return env().then( window => {
				assert.htmlEqual = ( actual, expected, message ) => {
					window.document.body.innerHTML = actual.trim();
					cleanChildren( window.document.body, '' );
					actual = window.document.body.innerHTML;

					window.document.body.innerHTML = expected.trim();
					cleanChildren( window.document.body, '' );
					expected = window.document.body.innerHTML;

					assert.deepEqual( actual, expected, message );
				};
			});
		});

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
						if ( !config.show ) console.log( withLineNumbers ); // eslint-disable-line no-console
						throw err;
					});
			});
		});
	});
});
