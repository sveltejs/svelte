import * as fs from 'fs';
import assert from 'assert';
import { svelte, exists, tryToLoadJson } from './helpers.js';

describe( 'validate', () => {
	fs.readdirSync( 'test/validator' ).forEach( dir => {
		if ( dir[0] === '.' ) return;

		const solo = exists( `test/validator/${dir}/solo` );

		( solo ? it.only : it )( dir, () => {
			const filename = `test/validator/${dir}/input.html`;
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

				const expectedErrors = tryToLoadJson( `test/validator/${dir}/errors.json` ) || [];
				const expectedWarnings = tryToLoadJson( `test/validator/${dir}/warnings.json` ) || [];
				const expectedNames = tryToLoadJson( `test/validator/${dir}/names.json` ) || [];

				assert.deepEqual( errors, expectedErrors );
				assert.deepEqual( warnings, expectedWarnings );
				assert.deepEqual( names, expectedNames );
			} catch ( err ) {
				if ( err.name !== 'ParseError' ) throw err;

				try {
					const expected = require( `./validator/${dir}/errors.json` )[0];

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
