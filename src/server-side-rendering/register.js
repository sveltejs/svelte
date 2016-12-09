import * as fs from 'fs';
import { compile } from '../index.js';

require.extensions[ '.html' ] = function ( module, filename ) {
	const { code } = compile( fs.readFileSync( filename, 'utf-8' ), {
		filename,
		generate: 'ssr'
	});
	return module._compile( code, filename );
};
