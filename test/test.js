import deindent from '../src/utils/deindent.js';
import spaces from '../src/utils/spaces.js';
import assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import jsdom from 'jsdom';
import * as acorn from 'acorn';
import { SourceMapConsumer } from 'source-map';
import { getLocator } from 'locate-character';

import * as consoleGroup from 'console-group';
consoleGroup.install();

import * as sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

// for coverage purposes, we need to test source files,
// but for sanity purposes, we need to test dist files
const svelte = process.env.COVERAGE ?
	require( '../compiler/index.js' ) :
	require( '../dist/svelte.js' );

const cache = {};

let showCompiledCode = false;

require.extensions[ '.html' ] = function ( module, filename ) {
	const code = cache[ filename ] || ( cache[ filename ] = svelte.compile( fs.readFileSync( filename, 'utf-8' ) ).code );
	if ( showCompiledCode ) console.log( addLineNumbers( code ) ); // eslint-disable-line no-console

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

function addLineNumbers ( code ) {
	return code.split( '\n' ).map( ( line, i ) => {
		i = String( i + 1 );
		while ( i.length < 3 ) i = ` ${i}`;

		return `${i}: ${line.replace( /^\t+/, match => match.split( '\t' ).join( '    ' ) )}`;
	}).join( '\n' );
}

describe( 'svelte', () => {
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

	describe( 'parse', () => {
		fs.readdirSync( 'test/parser' ).forEach( dir => {
			if ( dir[0] === '.' ) return;

			const solo = exists( `test/parser/${dir}/solo` );

			( solo ? it.only : it )( dir, () => {
				const input = fs.readFileSync( `test/parser/${dir}/input.html`, 'utf-8' ).replace( /\s+$/, '' );

				try {
					const actual = svelte.parse( input );
					const expected = require( `./parser/${dir}/output.json` );

					assert.deepEqual( actual.html, expected.html );
					assert.deepEqual( actual.css, expected.css );
					assert.deepEqual( actual.js, expected.js );
				} catch ( err ) {
					if ( err.name !== 'ParseError' ) throw err;

					try {
						const expected = require( `./parser/${dir}/error.json` );

						assert.equal( err.message, expected.message );
						assert.deepEqual( err.loc, expected.loc );
						assert.equal( err.pos, expected.pos );
					} catch ( err2 ) {
						throw err2.code === 'MODULE_NOT_FOUND' ? err : err2;
					}
				}
			});
		});
	});

	describe( 'validate', () => {
		function tryToLoadJson ( file ) {
			try {
				return JSON.parse( fs.readFileSync( file ) );
			} catch ( err ) {
				if ( err.code !== 'ENOENT' ) throw err;
				return null;
			}
		}

		fs.readdirSync( 'test/validator' ).forEach( dir => {
			if ( dir[0] === '.' ) return;

			const solo = exists( `test/validator/${dir}/solo` );

			( solo ? it.only : it )( dir, () => {
				const input = fs.readFileSync( `test/validator/${dir}/input.html`, 'utf-8' ).replace( /\s+$/, '' );

				try {
					const parsed = svelte.parse( input );

					const errors = [];
					const warnings = [];

					const { names } = svelte.validate( parsed, input, {
						onerror ( error ) {
							errors.push({
								message: error.message,
								pos: error.pos,
								loc: error.loc
							});
						},

						onwarn ( warning ) {
							warnings.push({
								message: warning.message,
								pos: warning.pos,
								loc: warning.loc
							});
						}
					});

					const expectedErrors = tryToLoadJson( `test/validator/${dir}/errors.json` ) || [];
					const expectedWarnings = tryToLoadJson( `test/validator/${dir}/warnings.json` ) || [];
					const expectedNames = tryToLoadJson( `test/validator/${dir}/names.json` ) || [];

					assert.deepEqual( errors, expectedErrors );
					assert.deepEqual( warnings, expectedWarnings );
					assert.deepEqual( names, expectedNames );
				} catch ( err ) {
					if ( err.name !== 'ParseError' ) throw err;

					try {
						const expected = require( `./validator/${dir}/error.json` );

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

	describe( 'generate', () => {
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

		fs.readdirSync( 'test/compiler' ).forEach( dir => {
			if ( dir[0] === '.' ) return;

			const config = loadConfig( dir );

			( config.skip ? it.skip : config.solo ? it.only : it )( dir, () => {
				let compiled;

				showCompiledCode = config.show;

				try {
					const source = fs.readFileSync( `test/compiler/${dir}/main.html`, 'utf-8' );
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

				cache[ path.resolve( `test/compiler/${dir}/main.html` ) ] = code;

				let SvelteComponent;

				try {
					SvelteComponent = require( `./compiler/${dir}/main.html` ).default;
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
		});
	});

	describe( 'formats', () => {
		function testAmd ( code, expectedId, dependencies, html ) {
			const fn = new Function( 'define', code );

			return env().then( window => {
				function define ( id, deps, factory ) {
					assert.equal( id, expectedId );
					assert.deepEqual( deps, Object.keys( dependencies ) );

					const SvelteComponent = factory( ...Object.keys( dependencies ).map( key => dependencies[ key ] ) );

					const main = window.document.body.querySelector( 'main' );
					const component = new SvelteComponent({ target: main });

					assert.htmlEqual( main.innerHTML, html );

					component.teardown();
				}

				define.amd = true;

				fn( define );
			});
		}

		function testCjs ( code, dependencyById, html ) {
			const fn = new Function( 'module', 'exports', 'require', code );

			return env().then( window => {
				const module = { exports: {} };
				const require = id => {
					return dependencyById[ id ];
				};

				fn( module, module.exports, require );

				const SvelteComponent = module.exports;

				const main = window.document.body.querySelector( 'main' );
				const component = new SvelteComponent({ target: main });

				assert.htmlEqual( main.innerHTML, html );

				component.teardown();
			});
		}

		function testIife ( code, name, globals, html ) {
			const fn = new Function( Object.keys( globals ), `${code}\n\nreturn ${name};` );

			return env().then( window => {
				const SvelteComponent = fn( ...Object.keys( globals ).map( key => globals[ key ] ) );

				const main = window.document.body.querySelector( 'main' );
				const component = new SvelteComponent({ target: main });

				assert.htmlEqual( main.innerHTML, html );

				component.teardown();
			});
		}

		describe( 'amd', () => {
			it( 'generates an AMD module', () => {
				const source = deindent`
					<div>{{answer}}</div>

					<script>
						import answer from 'answer';

						export default {
							data () {
								return { answer };
							}
						};
					</script>
				`;

				const { code } = svelte.compile( source, {
					format: 'amd',
					amd: { id: 'foo' }
				});

				return testAmd( code, 'foo', { answer: 42 }, `<div>42</div>` );
			});
		});

		describe( 'cjs', () => {
			it( 'generates a CommonJS module', () => {
				const source = deindent`
					<div>{{answer}}</div>

					<script>
						import answer from 'answer';

						export default {
							data () {
								return { answer };
							}
						};
					</script>
				`;

				const { code } = svelte.compile( source, {
					format: 'cjs'
				});

				return testCjs( code, { answer: 42 }, `<div>42</div>` );
			});
		});

		describe( 'iife', () => {
			it( 'generates a self-executing script', () => {
				const source = deindent`
					<div>{{answer}}</div>

					<script>
						import answer from 'answer';

						export default {
							data () {
								return { answer };
							}
						};
					</script>
				`;

				const { code } = svelte.compile( source, {
					format: 'iife',
					name: 'Foo',
					globals: {
						answer: 'answer'
					}
				});

				return testIife( code, 'Foo', { answer: 42 }, `<div>42</div>` );
			});
		});

		describe( 'umd', () => {
			it( 'generates a UMD build', () => {
				const source = deindent`
					<div>{{answer}}</div>

					<script>
						import answer from 'answer';

						export default {
							data () {
								return { answer };
							}
						};
					</script>
				`;

				const { code } = svelte.compile( source, {
					format: 'umd',
					name: 'Foo',
					globals: {
						answer: 'answer'
					},
					amd: {
						id: 'foo'
					}
				});

				return testAmd( code, 'foo', { answer: 42 }, `<div>42</div>` )
					.then( () => testCjs( code, { answer: 42 }, `<div>42</div>` ) )
					.then( () => testIife( code, 'Foo', { answer: 42 }, `<div>42</div>` ) );
			});
		});
	});

	describe( 'sourcemaps', () => {
		fs.readdirSync( 'test/sourcemaps' ).forEach( dir => {
			if ( dir[0] === '.' ) return;

			const solo = exists( `test/sourcemaps/${dir}/solo` );

			( solo ? it.only : it )( dir, () => {
				const input = fs.readFileSync( `test/sourcemaps/${dir}/input.html`, 'utf-8' ).replace( /\s+$/, '' );
				const { code, map } = svelte.compile( input );

				fs.writeFileSync( `test/sourcemaps/${dir}/output.js`, `${code}\n//# sourceMappingURL=output.js.map` );
				fs.writeFileSync( `test/sourcemaps/${dir}/output.js.map`, JSON.stringify( map, null, '  ' ) );

				const { test } = require( `./sourcemaps/${dir}/test.js` );

				const smc = new SourceMapConsumer( map );

				const locateInSource = getLocator( input );
				const locateInGenerated = getLocator( code );

				test({ assert, code, map, smc, locateInSource, locateInGenerated });
			});
		});
	});
});
