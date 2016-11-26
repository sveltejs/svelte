export default function getIntro ( format, options, imports ) {
	const dependencies = imports.map( declaration => {
		return {
			source: declaration.source.value,
			name: declaration.name
		};
	});

	if ( format === 'es' ) return '';
	if ( format === 'amd' ) return getAmdIntro( options.amd, dependencies );
	if ( format === 'cjs' ) return getCjsIntro( dependencies );

	throw new Error( `Not implemented: ${format}` );
}

function getAmdIntro ( options = {}, dependencies ) {
	const sourceString = dependencies.length ?
		`[ ${dependencies.map( dep => `'${dep.source}'` ).join( ', ' )} ], ` :
		'';

	const paramString = dependencies.length ? ` ${dependencies.map( dep => dep.name ).join( ', ' )} ` : '';

	return `define(${options.id ? ` '${options.id}', ` : ''}${sourceString}function (${paramString}) { 'use strict';\n\n`;
}

function getCjsIntro ( dependencies ) {
	const requireBlock = dependencies
		.map( dep => `var ${dep.name} = require( '${dep.source}' );` )
		.join( '\n\n' );

	if ( requireBlock ) {
		return `'use strict';\n\n${requireBlock}\n\n`;
	}

	return `'use strict';\n\n`;
}
