import deindent from '../../utils/deindent.js';
import CodeBuilder from '../../utils/CodeBuilder.js';
import flattenReference from '../../utils/flattenReference.js';
import processCss from '../shared/processCss.js';
import visitors from './visitors/index.js';
import Generator from '../Generator.js';

class SsrGenerator extends Generator {
	constructor ( parsed, source, name, names, visitors, options ) {
		super( parsed, source, name, names, visitors, options );
		this.bindings = [];
		this.renderCode = '';
	}

	addBinding ( binding, name ) {
		const conditions = [ `!( '${binding.name}' in root )`].concat( // TODO handle contextual bindings...
			this.current.conditions.map( c => `(${c})` )
		);

		const { keypath } = flattenReference( binding.value );

		this.bindings.push( deindent`
			if ( ${conditions.join( '&&' )} ) {
				tmp = ${name}.data();
				if ( '${keypath}' in tmp ) {
					root.${binding.name} = tmp.${keypath};
					settled = false;
				}
			}
		` );
	}

	append ( code ) {
		this.renderCode += code;
	}
}

export default function ssr ( parsed, source, options, names ) {
	const format = options.format || 'cjs';
	const name = options.name || 'SvelteComponent';

	const generator = new SsrGenerator( parsed, source, name, names, visitors, options );

	const { computations, templateProperties } = generator.parseJs();

	const builders = {
		main: new CodeBuilder(),
		bindings: new CodeBuilder(),
		render: new CodeBuilder(),
		renderCss: new CodeBuilder()
	};

	// create main render() function
	generator.push({
		contexts: {},
		indexes: {},
		conditions: []
	});

	parsed.html.children.forEach( node => generator.visit( node ) );

	builders.render.addLine(
		templateProperties.data ? `root = Object.assign( ${generator.alias( 'template' )}.data(), root || {} );` : `root = root || {};`
	);

	computations.forEach( ({ key, deps }) => {
		builders.render.addLine(
			`root.${key} = ${generator.alias( 'template' )}.computed.${key}( ${deps.map( dep => `root.${dep}` ).join( ', ' )} );`
		);
	});

	if ( generator.bindings.length ) {
		const bindings = generator.bindings.join( '\n\n' );

		builders.render.addBlock( deindent`
			var settled = false;
			var tmp;

			while ( !settled ) {
				settled = true;

				${bindings}
			}
		` );
	}

	builders.render.addBlock(
		`return \`${generator.renderCode}\`;`
	);

	// create renderCss() function
	builders.renderCss.addBlock(
		`var components = [];`
	);

	if ( parsed.css ) {
		builders.renderCss.addBlock( deindent`
			components.push({
				filename: ${name}.filename,
				css: ${JSON.stringify( processCss( parsed, generator.code ) )},
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

		templateProperties.components.value.properties.forEach( prop => {
			builders.renderCss.addLine( `addComponent( ${generator.alias( 'template' )}.components.${prop.key.name} );` );
		});
	}

	builders.renderCss.addBlock( deindent`
		return {
			css: components.map( x => x.css ).join( '\\n' ),
			map: null,
			components
		};
	` );

	if ( parsed.js ) {
		builders.main.addBlock( `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]` );
	}

	builders.main.addBlock( deindent`
		var ${name} = {};

		${name}.filename = ${JSON.stringify( options.filename )};

		${name}.data = function () {
			return ${templateProperties.data ? `${generator.alias( 'template' )}.data()` : `{}`};
		};

		${name}.render = function ( root, options ) {
			${builders.render}
		};

		${name}.renderCss = function () {
			${builders.renderCss}
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
	` );

	const result = builders.main.toString();

	return generator.generate( result, options, { name, format } );
}
