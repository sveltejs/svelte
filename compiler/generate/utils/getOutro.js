export default function getOutro ( format, name, imports ) {
	if ( format === 'es' ) {
		return `export default ${name};`;
	}

	if ( format === 'amd' ) {
		return `return ${name};\n\n});`;
	}

	if ( format === 'cjs' ) {
		return `module.exports = ${name};`;
	}

	throw new Error( `Not implemented: ${format}` );
}
