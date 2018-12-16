const fs = require( 'fs' );
const path = require( 'path' );

export function test({ assert, map }) {
	assert.deepEqual( map.sources, [ 'input.html' ]);
	assert.deepEqual( map.sourcesContent, [
		fs.readFileSync( path.join( __dirname, 'input.html' ), 'utf-8' )
	]);
}
