import * as fs from 'fs';
import compile from './compile.js';

require.extensions[ '.html' ] = function ( module, filename ) {
	const { code } = compile( fs.readFileSync( filename, 'utf-8' ) );

	try {
		return module._compile( code, filename );
	} catch ( err ) {
		console.log( code );
		throw err;
	}
};
