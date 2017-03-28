import assert from 'assert';
import * as fs from 'fs';
import { svelte, exists } from '../helpers.js';

describe( 'css', () => {
	fs.readdirSync( 'test/css/samples' ).forEach( dir => {
		if ( dir[0] === '.' ) return;

		const solo = exists( `test/css/samples/${dir}/solo` );

		if ( solo && process.env.CI ) {
			throw new Error( 'Forgot to remove `solo: true` from test' );
		}

		( solo ? it.only : it )( dir, () => {
			const input = fs.readFileSync( `test/css/samples/${dir}/input.html`, 'utf-8' ).replace( /\s+$/, '' );

			const actual = svelte.compile( input ).css;
			fs.writeFileSync( `test/css/samples/${dir}/_actual.css`, actual );
			const expected = fs.readFileSync( `test/css/samples/${dir}/expected.css`, 'utf-8' );

			assert.equal( actual.trim(), expected.trim() );
		});
	});
});
