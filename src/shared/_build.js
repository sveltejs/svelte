const fs = require( 'fs' );
const path = require( 'path' );
const acorn = require( 'acorn' );

const declarations = {};

fs.readdirSync( __dirname ).forEach( file => {
	if ( !/^[a-z]+\.js$/.test( file ) ) return;

	const source = fs.readFileSync( path.join( __dirname, file ), 'utf-8' );
	const ast = acorn.parse( source, {
		ecmaVersion: 6,
		sourceType: 'module'
	});

	ast.body.forEach( node => {
		if ( node.type !== 'ExportNamedDeclaration' ) return;

		const declaration = node.declaration;
		if ( !declaration ) return;

		const name = declaration.type === 'VariableDeclaration' ?
			declaration.declarations[0].id.name :
			declaration.id.name;

		const value = declaration.type === 'VariableDeclaration' ?
			declaration.declarations[0].init :
			declaration;

		declarations[ name ] = source.slice( value.start, value.end );
	});
});

fs.writeFileSync( 'src/generators/dom/shared.js', `// this file is auto-generated, do not edit it
export default ${JSON.stringify( declarations, null, '\t' )};` );