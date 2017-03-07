const nodeVersionMatch = /^v(\d)/.exec( process.version );
const legacy = +nodeVersionMatch[1] < 6;
const babelrc = require( '../package.json' ).babel;

if ( legacy ) {
	require( 'babel-register' )( babelrc );
} else {
	require( 'reify' );
}