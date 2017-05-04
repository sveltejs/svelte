import deindent from '../../utils/deindent.js';
import Generator from '../Generator.js';
import Block from './Block.js';
import visit from './visit.js';

class SsrGenerator extends Generator {
	constructor ( parsed, source, name, options ) {
		super( parsed, source, name, options );
		this.bindings = [];
		this.renderCode = '';
	}

	append ( code ) {
		this.renderCode += code;
	}
}

export default function ssr ( parsed, source, options ) {
	const format = options.format || 'cjs';
	const name = options.name || 'SvelteComponent';

	const generator = new SsrGenerator( parsed, source, name, options );

	const { computations, hasJs, templateProperties } = generator.parseJs( true );

	// create main render() function
	const mainBlock = new Block({
		generator,
		contexts: new Map(),
		indexes: new Map(),
		conditions: []
	});

	parsed.html.children.forEach( node => {
		visit( generator, mainBlock, node );
	});

	const result = deindent`
		${hasJs && `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]`}

		var ${name} = {};

		${name}.filename = ${JSON.stringify( options.filename )};

		${name}.data = function () {
			return ${templateProperties.data ? `${generator.alias( 'template' )}.data()` : `{}`};
		};

		${name}.render = function ( state, options ) {
			${templateProperties.data ? `state = Object.assign( ${generator.alias( 'template' )}.data(), state || {} );` : `state = state || {};`}

			${computations.map( ({ key, deps }) =>
				`state.${key} = ${generator.alias( 'template' )}.computed.${key}( ${deps.map( dep => `state.${dep}` ).join( ', ' )} );`
			)}

			${generator.bindings.length && deindent`
				var settled = false;
				var tmp;

				while ( !settled ) {
					settled = true;

					${generator.bindings.join( '\n\n' )}
				}
			`}

			return \`${generator.renderCode}\`;
		};

		${name}.renderCss = function () {
			var components = [];

			${generator.css && deindent`
				components.push({
					filename: ${name}.filename,
					css: ${JSON.stringify( generator.css )},
					map: null // TODO
				});
			`}

			${templateProperties.components && deindent`
				var seen = {};

				function addComponent ( component ) {
					var result = component.renderCss();
					result.components.forEach( x => {
						if ( seen[ x.filename ] ) return;
						seen[ x.filename ] = true;
						components.push( x );
					});
				}

				${
					templateProperties.components.value.properties.map( prop => {
						const { name } = prop.key;
						const expression = generator.importedComponents.get( name ) || `${generator.alias( 'template' )}.components.${name}`;
						return `addComponent( ${expression} );`;
					})
				}
			`}

			return {
				css: components.map( x => x.css ).join( '\\n' ),
				map: null,
				components
			};
		};

		var escaped = {
			'"': '&quot;',
			"'": '&#39;',
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;'
		};

		function __escape ( html ) {
			return String( html ).replace( /["'&<>]/g, match => escaped[ match ] );
		}
	`;

	return generator.generate( result, options, { name, format } );
}
