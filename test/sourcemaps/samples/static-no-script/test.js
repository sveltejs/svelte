const fs = require( 'fs' );
const path = require( 'path' );

export function test({ assert, map }) {
	assert.deepEqual( map.sources, [ 'input.svelte' ]);
	assert.deepEqual( map.sourcesContent, [
		fs.readFileSync( path.join( __dirname, 'input.svelte' ), 'utf-8' )
	]);
}
