import deindent from '../../utils/deindent.js';
import CodeBuilder from '../../utils/CodeBuilder.js';
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

	const builders = {
		main: new CodeBuilder(),
		bindings: new CodeBuilder(),
		render: new CodeBuilder(),
		renderCss: new CodeBuilder()
	};

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

	builders.render.addLine(
		templateProperties.data ? `state = Object.assign( ${generator.alias( 'template' )}.data(), state || {} );` : `state = state || {};`
	);

	computations.forEach( ({ key, deps }) => {
		builders.render.addLine(
			`state.${key} = ${generator.alias( 'template' )}.computed.${key}( ${deps.map( dep => `state.${dep}` ).join( ', ' )} );`
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

	if ( generator.css ) {
		builders.renderCss.addBlock( deindent`
			components.push({
				filename: ${name}.filename,
				css: ${JSON.stringify( generator.css )},
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
			const { name } = prop.key;
			const expression = generator.importedComponents.get( name ) || `${generator.alias( 'template' )}.components.${name}`;
			builders.renderCss.addLine( `addComponent( ${expression} );` );
		});
	}

	builders.renderCss.addBlock( deindent`
		return {
			css: components.map( x => x.css ).join( '\\n' ),
			map: null,
			components
		};
	` );

	if ( hasJs ) {
		builders.main.addBlock( `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]` );
	}

	builders.main.addBlock( deindent`
		var ${name} = {};

		${name}.filename = ${JSON.stringify( options.filename )};

		${name}.data = function () {
			return ${templateProperties.data ? `${generator.alias( 'template' )}.data()` : `{}`};
		};

		${name}.render = function ( state, options ) {
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
