import spaces from '../src/utils/spaces.js';
import assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as acorn from 'acorn';

import { svelte, env, setupHtmlEqual } from './helpers.js';

const cache = {};

let showCompiledCode = false;
let compileOptions = null;

require.extensions[ '.html' ] = function ( module, filename ) {
	const options = Object.assign({ filename }, compileOptions );
	const code = cache[ filename ] || ( cache[ filename ] = svelte.compile( fs.readFileSync( filename, 'utf-8' ), options ).code );
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
		return require( `./generator/${dir}/_config.js` ).default;
	} catch ( err ) {
		if ( err.code === 'E_NOT_FOUND' ) {
			return {};
		}

		throw err;
	}
}

describe( 'generate', () => {
	before( setupHtmlEqual );

	fs.readdirSync( 'test/generator' ).forEach( dir => {
		if ( dir[0] === '.' ) return;

		const config = loadConfig( dir );

		( config.skip ? it.skip : config.solo ? it.only : it )( dir, () => {
			let compiled;

			showCompiledCode = config.show;
			compileOptions = config.compileOptions || {};

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

			cache[ path.resolve( `test/generator/${dir}/main.html` ) ] = code;

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
	});
});
