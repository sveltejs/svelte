import * as fs from 'fs';
import assert from 'assert';
import { svelte, exists, tryToLoadJson } from '../helpers.js';

describe( 'validate', () => {
	fs.readdirSync( 'test/validator/samples' ).forEach( dir => {
		if ( dir[0] === '.' ) return;

		const solo = exists( `test/validator/samples/${dir}/solo` );

		if ( solo && process.env.CI ) {
			throw new Error( 'Forgot to remove `solo: true` from test' );
		}

		( solo ? it.only : it )( dir, () => {
			const filename = `test/validator/samples/${dir}/input.html`;
			const input = fs.readFileSync( filename, 'utf-8' ).replace( /\s+$/, '' );

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

				const expectedErrors = tryToLoadJson( `test/validator/samples/${dir}/errors.json` ) || [];
				const expectedWarnings = tryToLoadJson( `test/validator/samples/${dir}/warnings.json` ) || [];
				const expectedNames = tryToLoadJson( `test/validator/samples/${dir}/names.json` );

				assert.deepEqual( errors, expectedErrors );
				assert.deepEqual( warnings, expectedWarnings );
				if ( expectedNames ) {
					assert.deepEqual( names, expectedNames );
				}
			} catch ( err ) {
				if ( err.name !== 'ParseError' ) throw err;

				try {
					const expected = require( `./samples/${dir}/errors.json` )[0];

					assert.equal( err.message, expected.message );
					assert.deepEqual( err.loc, expected.loc );
					assert.equal( err.pos, expected.pos );
				} catch ( err2 ) {
					throw err2.code === 'MODULE_NOT_FOUND' ? err : err2;
				}
			}
		});
	});

	it( 'errors if options.name is illegal', () => {
		assert.throws( () => {
			svelte.compile( '<div></div>', {
				name: 'not.valid'
			});
		}, /options\.name must be a valid identifier/ );
	});
});
