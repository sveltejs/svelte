import assert from 'assert';
import * as fs from 'fs';
import { svelte, exists } from './helpers.js';

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
