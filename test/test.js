import { compile } from '../compiler/index.js';
import * as assert from 'assert';
import * as fs from 'fs';
import jsdom from 'jsdom';

require.extensions[ '.svelte' ] = function ( module, filename ) {
	const source = fs.readFileSync( filename, 'utf-8' );
	const compiled = compile( source );

	return module._compile( compiled, filename );
};

describe( 'svelte', () => {
	function loadConfig ( dir ) {
		try {
			return require( `./samples/${dir}/_config.js` ).default;
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
					fulfil( window );
				}
			});
		});
	}

	fs.readdirSync( 'test/samples' ).forEach( dir => {
		if ( dir[0] === '.' ) return;

		it( dir, () => {
			const config = loadConfig( dir );
			const factory = require( `./samples/${dir}/main.svelte` ).default;

			return env().then( window => {
				const target = window.document.querySelector( 'main' );

				const component = factory({
					target,
					data: config.data
				});

				if ( config.html ) {
					assert.equal( target.innerHTML, config.html );
				}
			});
		});
	});
});
