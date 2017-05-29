import assert from 'assert';
import * as fs from 'fs';
import { svelte } from '../helpers.js';

function tryRequire ( file ) {
	try {
		return require( file ).default;
	} catch ( err ) {
		if ( err.code !== 'MODULE_NOT_FOUND' ) throw err;
		return null;
	}
}

describe( 'css', () => {
	fs.readdirSync( 'test/css/samples' ).forEach( dir => {
		if ( dir[0] === '.' ) return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test( dir );

		if ( solo && process.env.CI ) {
			throw new Error( 'Forgot to remove `solo: true` from test' );
		}

		( solo ? it.only : it )( dir, () => {
			const config = tryRequire( `./samples/${dir}/_config.js` ) || {};
			const input = fs.readFileSync( `test/css/samples/${dir}/input.html`, 'utf-8' ).replace( /\s+$/, '' );

			const actual = svelte.compile( input, config ).css;
			fs.writeFileSync( `test/css/samples/${dir}/_actual.css`, actual );
			const expected = fs.readFileSync( `test/css/samples/${dir}/expected.css`, 'utf-8' );

			assert.equal( actual.trim(), expected.trim() );
		});
	});
});
