import getGlobals from './getGlobals';

export default function getOutro ( format, name, options, imports ) {
	if ( format === 'es' ) {
		return `export default ${name};`;
	}

	if ( format === 'amd' ) {
		return `return ${name};\n\n});`;
	}

	if ( format === 'cjs' ) {
		return `module.exports = ${name};`;
	}

	if ( format === 'iife' ) {
		const globals = getGlobals( imports, options );
		return `return ${name};\n\n}(${globals.join( ', ' )}));`;
	}

	if ( format === 'eval' ) {
		const globals = getGlobals( imports, options );
		return `return ${name};\n\n}(${globals.join( ', ' )}));`;
	}

	if ( format === 'umd' ) {
		return `return ${name};\n\n})));`;
	}

	throw new Error( `Not implemented: ${format}` );
}
