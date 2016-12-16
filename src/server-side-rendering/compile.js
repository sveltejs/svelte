import { walk } from 'estree-walker';
import deindent from '../utils/deindent.js';
import isReference from '../utils/isReference.js';
import flattenReference from '../utils/flattenReference.js';
import MagicString, { Bundle } from 'magic-string';
import processCss from '../generate/css/process.js';
import voidElementNames from '../utils/voidElementNames.js';

export default function compile ( parsed, source, { filename }) {
	const code = new MagicString( source );

	const templateProperties = {};
	const components = {};
	const helpers = {};

	const imports = [];

	if ( parsed.js ) {
		walk( parsed.js.content, {
			enter ( node ) {
				code.addSourcemapLocation( node.start );
				code.addSourcemapLocation( node.end );
			}
		});

		// imports need to be hoisted out of the IIFE
		for ( let i = 0; i < parsed.js.content.body.length; i += 1 ) {
			const node = parsed.js.content.body[i];
			if ( node.type === 'ImportDeclaration' ) {
				let a = node.start;
				let b = node.end;
				while ( /[ \t]/.test( source[ a - 1 ] ) ) a -= 1;
				while ( source[b] === '\n' ) b += 1;

				//imports.push( source.slice( a, b ).replace( /^\s/, '' ) );
				imports.push( node );
				code.remove( a, b );
			}
		}

		const defaultExport = parsed.js.content.body.find( node => node.type === 'ExportDefaultDeclaration' );

		if ( defaultExport ) {
			const finalNode = parsed.js.content.body[ parsed.js.content.body.length - 1 ];
			if ( defaultExport === finalNode ) {
				// export is last property, we can just return it
				code.overwrite( defaultExport.start, defaultExport.declaration.start, `return ` );
			} else {
				// TODO ensure `template` isn't already declared
				code.overwrite( defaultExport.start, defaultExport.declaration.start, `var template = ` );

				let i = defaultExport.start;
				while ( /\s/.test( source[ i - 1 ] ) ) i--;

				const indentation = source.slice( i, defaultExport.start );
				code.appendLeft( finalNode.end, `\n\n${indentation}return template;` );
			}

			defaultExport.declaration.properties.forEach( prop => {
				templateProperties[ prop.key.name ] = prop.value;
			});

			code.prependRight( parsed.js.content.start, 'var template = (function () {' );
		} else {
			code.prependRight( parsed.js.content.start, '(function () {' );
		}

		code.appendLeft( parsed.js.content.end, '}());' );

		if ( templateProperties.helpers ) {
			templateProperties.helpers.properties.forEach( prop => {
				helpers[ prop.key.name ] = prop.value;
			});
		}

		if ( templateProperties.components ) {
			templateProperties.components.properties.forEach( prop => {
				components[ prop.key.name ] = prop.value;
			});
		}
	}

	let scope = new Set();
	const scopes = [ scope ];

	function contextualise ( expression ) {
		walk( expression, {
			enter ( node, parent ) {
				if ( isReference( node, parent ) ) {
					const { name } = flattenReference( node );

					if ( parent && parent.type === 'CallExpression' && node === parent.callee && helpers[ name ] ) {
						code.prependRight( node.start, `template.helpers.` );
						return;
					}

					if ( !scope.has( name ) ) {
						code.prependRight( node.start, `data.` );
					}

					this.skip();
				}
			}
		});

		return {
			snippet: `[✂${expression.start}-${expression.end}✂]`,
			string: code.slice( expression.start, expression.end )
		};
	}

	let elementDepth = 0;

	const stringifiers = {
		Comment () {
			return '';
		},

		Component ( node ) {
			const props = node.attributes.map( attribute => {
				let value;

				if ( attribute.value === true ) {
					value = `true`;
				} else if ( attribute.value.length === 0 ) {
					value = `''`;
				} else if ( attribute.value.length === 1 ) {
					const chunk = attribute.value[0];
					if ( chunk.type === 'Text' ) {
						value = isNaN( parseFloat( chunk.data ) ) ? JSON.stringify( chunk.data ) : chunk.data;
					} else {
						const { snippet } = contextualise( chunk.expression );
						value = snippet;
					}
				} else {
					value = '`' + attribute.value.map( stringify ).join( '' ) + '`';
				}

				return `${attribute.name}: ${value}`;
			}).join( ', ' );

			let params = `{${props}}`;

			if ( node.children.length ) {
				params += `, { yield: () => \`${node.children.map( stringify ).join( '' )}\` }`;
			}

			return `\${template.components.${node.name}.render(${params})}`;
		},

		EachBlock ( node ) {
			const { snippet } = contextualise( node.expression );

			scope = new Set();
			scope.add( node.context );
			if ( node.index ) scope.add( node.index );

			scopes.push( scope );

			const block = `\${ ${snippet}.map( ${ node.index ? `( ${node.context}, ${node.index} )` : node.context} => \`${ node.children.map( stringify ).join( '' )}\` ).join( '' )}`;

			scopes.pop();
			scope = scopes[ scopes.length - 1 ];

			return block;
		},

		Element ( node ) {
			if ( node.name in components ) {
				return stringifiers.Component( node );
			}

			let element = `<${node.name}`;

			node.attributes.forEach( attribute => {
				if ( attribute.type !== 'Attribute' ) return;

				let str = ` ${attribute.name}`;

				if ( attribute.value !== true ) {
					str += `="` + attribute.value.map( chunk => {
						if ( chunk.type === 'Text' ) {
							return chunk.data;
						}

						const { snippet } = contextualise( chunk.expression );
						return '${' + snippet + '}';
					}).join( '' ) + `"`;
				}

				element += str;
			});

			if ( parsed.css && elementDepth === 0 ) {
				element += ` svelte-${parsed.hash}`;
			}

			if ( voidElementNames.test( node.name ) ) {
				element += '>';
			} else {
				elementDepth += 1;
				element += '>' + node.children.map( stringify ).join( '' ) + `</${node.name}>`;
				elementDepth -= 1;
			}

			return element;
		},

		IfBlock ( node ) {
			const { snippet } = contextualise( node.expression ); // TODO use snippet, for sourcemap support

			const consequent = node.children.map( stringify ).join( '' );
			const alternate = node.else ? node.else.children.map( stringify ).join( '' ) : '';

			return '${ ' + snippet + ' ? `' + consequent + '` : `' + alternate + '` }';
		},

		MustacheTag ( node ) {
			const { snippet } = contextualise( node.expression ); // TODO use snippet, for sourcemap support
			return '${__escape( String( ' + snippet + ') )}';
		},

		RawMustacheTag ( node ) {
			const { snippet } = contextualise( node.expression ); // TODO use snippet, for sourcemap support
			return '${' + snippet + '}';
		},

		Text ( node ) {
			return node.data.replace( /\${/g, '\\${' );
		},

		YieldTag () {
			return `\${options.yield()}`;
		}
	};

	function stringify ( node ) {
		const stringifier = stringifiers[ node.type ];

		if ( !stringifier ) {
			throw new Error( `Not implemented: ${node.type}` );
		}

		return stringifier( node );
	}

	function createBlock ( node ) {
		const str = stringify( node );
		if ( str.slice( 0, 2 ) === '${' ) return str.slice( 2, -1 );
		return '`' + str + '`';
	}

	const blocks = parsed.html.children.map( node => {
		return deindent`
			rendered += ${createBlock( node )};
		`;
	});

	const topLevelStatements = [];

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
			topLevelStatements.push( importBlock );
		}

		topLevelStatements.push( `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]` );
	}

	const renderStatements = [
		templateProperties.data ? `data = Object.assign( template.data(), data || {} );` : `data = data || {};`
	];

	if ( templateProperties.computed ) {
		const statements = [];
		const dependencies = new Map();

		templateProperties.computed.properties.forEach( prop => {
			const key = prop.key.name;
			const value = prop.value;

			const deps = value.params.map( param => param.name );
			dependencies.set( key, deps );
		});

		const visited = new Set();

		function visit ( key ) {
			if ( !dependencies.has( key ) ) return; // not a computation

			if ( visited.has( key ) ) return;
			visited.add( key );

			const deps = dependencies.get( key );
			deps.forEach( visit );

			statements.push( deindent`
				data.${key} = template.computed.${key}( ${deps.map( dep => `data.${dep}` ).join( ', ' )} );
			` );
		}

		templateProperties.computed.properties.forEach( prop => visit( prop.key.name ) );

		renderStatements.push( statements.join( '\n' ) );
	}

	renderStatements.push(
		`var rendered = '';`,
		blocks.join( '\n\n' ),
		`return rendered;`
	);

	const renderCssStatements = [
		`var components = [];`
	];

	if ( parsed.css ) {
		renderCssStatements.push( deindent`
			components.push({
				filename: exports.filename,
				css: ${JSON.stringify( processCss( parsed ) )},
				map: null // TODO
			});
		` );
	}

	if ( templateProperties.components ) {
		renderCssStatements.push( deindent`
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

		renderCssStatements.push( templateProperties.components.properties.map( prop => `addComponent( template.components.${prop.key.name} );` ).join( '\n' ) );
	}

	renderCssStatements.push( deindent`
		return {
			css: components.map( x => x.css ).join( '\\n' ),
			map: null,
			components
		};
	` );

	topLevelStatements.push( deindent`
		exports.filename = ${JSON.stringify( filename )};

		exports.render = function ( data, options ) {
			${renderStatements.join( '\n\n' )}
		};

		exports.renderCss = function () {
			${renderCssStatements.join( '\n\n' )}
		};

		var escaped = {
			'"': '&quot;',
			"'": '&39;',
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;'
		};

		function __escape ( html ) {
			return html.replace( /["'&<>]/g, match => escaped[ match ] );
		}
	` );

	const rendered = topLevelStatements.join( '\n\n' );

	const pattern = /\[✂(\d+)-(\d+)$/;

	const parts = rendered.split( '✂]' );
	const finalChunk = parts.pop();

	const compiled = new Bundle({ separator: '' });

	function addString ( str ) {
		compiled.addSource({
			content: new MagicString( str )
		});
	}

	parts.forEach( str => {
		const chunk = str.replace( pattern, '' );
		if ( chunk ) addString( chunk );

		const match = pattern.exec( str );

		const snippet = code.snip( +match[1], +match[2] );

		compiled.addSource({
			filename,
			content: snippet
		});
	});

	addString( finalChunk );

	return {
		code: compiled.toString()
	};
}
