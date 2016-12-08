import * as fs from 'fs';
import assert from 'assert';
import { svelte, exists } from './helpers.js';
import { SourceMapConsumer } from 'source-map';
import { getLocator } from 'locate-character';

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
