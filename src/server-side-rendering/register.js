import * as fs from 'fs';
import compile from './compile.js';

require.extensions[ '.html' ] = function ( module, filename ) {
	const { code } = compile( fs.readFileSync( filename, 'utf-8' ) );
	return module._compile( code, filename );
};
