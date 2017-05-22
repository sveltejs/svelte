const glob = require( 'glob' );
const fs = require( 'fs' );

glob.sync( 'src/**/*.js' ).forEach( file => {
	console.log( file );
	const js = fs.readFileSync( file, 'utf-8' );
	fs.writeFileSync( file.replace( /\.js$/, '.ts' ), js );
	fs.unlinkSync( file );
});