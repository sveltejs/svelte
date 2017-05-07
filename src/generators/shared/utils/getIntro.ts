import deindent from '../../../utils/deindent.js';
import getGlobals from './getGlobals';

export default function getIntro ( format, options, imports ) {
	if ( format === 'es' ) return '';
	if ( format === 'amd' ) return getAmdIntro( options, imports );
	if ( format === 'cjs' ) return getCjsIntro( options, imports );
	if ( format === 'iife' ) return getIifeIntro( options, imports );
	if ( format === 'umd' ) return getUmdIntro( options, imports );
	if ( format === 'eval' ) return getEvalIntro( options, imports );

	throw new Error( `Not implemented: ${format}` );
}

function getAmdIntro ( options, imports ) {
	const sourceString = imports.length ?
		`[ ${imports.map( declaration => `'${removeExtension( declaration.source.value )}'` ).join( ', ' )} ], ` :
		'';

	const id = options.amd && options.amd.id;

	return `define(${id ? ` '${id}', ` : ''}${sourceString}function (${paramString( imports )}) { 'use strict';\n\n`;
}

function getCjsIntro ( options, imports ) {
	const requireBlock = imports
		.map( declaration => `var ${declaration.name} = require( '${declaration.source.value}' );` )
		.join( '\n\n' );

	if ( requireBlock ) {
		return `'use strict';\n\n${requireBlock}\n\n`;
	}

	return `'use strict';\n\n`;
}

function getIifeIntro ( options, imports ) {
	if ( !options.name ) {
		throw new Error( `Missing required 'name' option for IIFE export` );
	}

	return `var ${options.name} = (function (${paramString( imports )}) { 'use strict';\n\n`;
}

function getUmdIntro ( options, imports ) {
	if ( !options.name ) {
		throw new Error( `Missing required 'name' option for UMD export` );
	}

	const amdId = options.amd && options.amd.id ? `'${options.amd.id}', ` : '';

	const amdDeps = imports.length ? `[${imports.map( declaration => `'${removeExtension( declaration.source.value )}'` ).join( ', ')}], ` : '';
	const cjsDeps = imports.map( declaration => `require('${declaration.source.value}')` ).join( ', ' );
	const globalDeps = getGlobals( imports, options );

	return deindent`
		(function ( global, factory ) {
			typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(${cjsDeps}) :
			typeof define === 'function' && define.amd ? define(${amdId}${amdDeps}factory) :
			(global.${options.name} = factory(${globalDeps}));
		}(this, (function (${paramString( imports )}) { 'use strict';` + '\n\n';
}

function getEvalIntro ( options, imports ) {
	return `(function (${paramString( imports )}) { 'use strict';\n\n`;
}

function paramString ( imports ) {
	return imports.length ? ` ${imports.map( dep => dep.name ).join( ', ' )} ` : '';
}

function removeExtension ( file ) {
	const index = file.lastIndexOf( '.' );
	return ~index ? file.slice( 0, index ) : file;
}
