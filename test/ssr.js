import assert from 'assert';
import * as fs from 'fs';

import { exists, setupHtmlEqual, tryToLoadJson } from './helpers.js';

function tryToReadFile ( file ) {
	try {
		return fs.readFileSync( file, 'utf-8' );
	} catch ( err ) {
		if ( err.code !== 'ENOENT' ) throw err;
		return null;
	}
}

describe( 'ssr', () => {
	before( () => {
		require( process.env.COVERAGE ?
			'../src/server-side-rendering/register.js' :
			'../ssr/register' );

		return setupHtmlEqual();
	});

	fs.readdirSync( 'test/server-side-rendering' ).forEach( dir => {
		if ( dir[0] === '.' ) return;

		const solo = exists( `test/server-side-rendering/${dir}/solo` );

		( solo ? it.only : it )( dir, () => {
			const component = require( `./server-side-rendering/${dir}/main.html` );

			const expectedHtml = tryToReadFile( `test/server-side-rendering/${dir}/_expected.html` );
			const expectedCss = tryToReadFile( `test/server-side-rendering/${dir}/_expected.css` ) || '';

			const data = tryToLoadJson( `test/server-side-rendering/${dir}/data.json` );
			const html = component.render( data );
			const { css } = component.renderCss();

			fs.writeFileSync( `test/server-side-rendering/${dir}/_actual.html`, html );
			if ( css ) fs.writeFileSync( `test/server-side-rendering/${dir}/_actual.css`, css );

			assert.htmlEqual( html, expectedHtml );
			assert.equal( css.replace( /^\s+/gm, '' ), expectedCss.replace( /^\s+/gm, '' ) );
		});
	});
});
