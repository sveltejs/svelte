import deindent from '../../utils/deindent.js';
import CodeBuilder from '../../utils/CodeBuilder.js';
import processCss from '../shared/css/process.js';
import visitors from './visitors/index.js';
import Generator from '../Generator.js';

export default function ssr ( parsed, source, options, names ) {
	const format = options.format || 'cjs';
	const constructorName = options.name || 'SvelteComponent';

	const generator = new Generator( parsed, source, names, visitors );

	const { computations, imports, templateProperties } = generator.parseJs();

	generator.push({
		contexts: {},
		indexes: {}
	});

	let renderCode = '';
	generator.on( 'append', str => {
		renderCode += str;
	});

	parsed.html.children.forEach( node => generator.visit( node ) );

	const builders = {
		main: new CodeBuilder(),
		render: new CodeBuilder(),
		renderCss: new CodeBuilder()
	};

	const importBlock = imports
		.map( ( declaration, i ) => {
			const defaultImport = declaration.specifiers.find( x => x.type === 'ImportDefaultSpecifier' || x.type === 'ImportSpecifier' && x.imported.name === 'default' );
			const namespaceImport = declaration.specifiers.find( x => x.type === 'ImportNamespaceSpecifier' );
			const namedImports = declaration.specifiers.filter( x => x.type === 'ImportSpecifier' && x.imported.name !== 'default' );

			const name = ( defaultImport || namespaceImport ) ? ( defaultImport || namespaceImport ).local.name : `__import${i}`;

			const statements = [
				`var ${name} = require( '${declaration.source.value}' );`
			];

			namedImports.forEach( specifier => {
				statements.push( `var ${specifier.local.name} = ${name}.${specifier.imported.name};` );
			});

			if ( defaultImport ) {
				statements.push( `${name} = ( ${name} && ${name}.__esModule ) ? ${name}['default'] : ${name};` );
			}

			return statements.join( '\n' );
		})
		.filter( Boolean )
		.join( '\n' );

	if ( parsed.js ) {
		if ( imports.length ) {
			builders.main.addBlock( importBlock );
		}

		builders.main.addBlock( `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]` );
	}

	builders.main.addBlock( `var ${constructorName} = {};` );

	builders.render.addLine(
		templateProperties.data ? `root = Object.assign( template.data(), root || {} );` : `root = root || {};`
	);

	if ( computations.length ) {
		computations.forEach( ({ key, deps }) => {
			builders.render.addLine(
				`root.${key} = template.computed.${key}( ${deps.map( dep => `root.${dep}` ).join( ', ' )} );`
			);
		});
	}

	builders.render.addBlock(
		`return \`${renderCode}\`;`
	);

	builders.renderCss.addBlock(
		`var components = [];`
	);

	if ( parsed.css ) {
		builders.renderCss.addBlock( deindent`
			components.push({
				filename: ${constructorName}.filename,
				css: ${JSON.stringify( processCss( parsed ) )},
				map: null // TODO
			});
		` );
	}

	if ( templateProperties.components ) {
		builders.renderCss.addBlock( deindent`
			var seen = {};

			function addComponent ( component ) {
				var result = component.renderCss();
				result.components.forEach( x => {
					if ( seen[ x.filename ] ) return;
					seen[ x.filename ] = true;
					components.push( x );
				});
			}
		` );

		templateProperties.components.properties.forEach( prop => {
			builders.renderCss.addLine( `addComponent( template.components.${prop.key.name} );` );
		});
	}

	builders.renderCss.addBlock( deindent`
		return {
			css: components.map( x => x.css ).join( '\\n' ),
			map: null,
			components
		};
	` );

	builders.main.addBlock( deindent`
		${constructorName}.filename = ${JSON.stringify( options.filename )};

		${constructorName}.render = function ( root, options ) {
			${builders.render}
		};

		${constructorName}.renderCss = function () {
			${builders.renderCss}
		};

		var escaped = {
			'"': '&quot;',
			"'": '&39;',
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;'
		};

		function __escape ( html ) {
			return String( html ).replace( /["'&<>]/g, match => escaped[ match ] );
		}
	` );

	const result = builders.main.toString();

	const generated = generator.generate( result, options, { constructorName, format } );

	// console.log( generated.code )

	return generated;
}
