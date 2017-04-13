import * as namespaces from '../../utils/namespaces.js';
import flattenReference from '../../utils/flattenReference.js';

const svg = /^(?:altGlyph|altGlyphDef|altGlyphItem|animate|animateColor|animateMotion|animateTransform|circle|clipPath|color-profile|cursor|defs|desc|discard|ellipse|feBlend|feColorMatrix|feComponentTransfer|feComposite|feConvolveMatrix|feDiffuseLighting|feDisplacementMap|feDistantLight|feDropShadow|feFlood|feFuncA|feFuncB|feFuncG|feFuncR|feGaussianBlur|feImage|feMerge|feMergeNode|feMorphology|feOffset|fePointLight|feSpecularLighting|feSpotLight|feTile|feTurbulence|filter|font|font-face|font-face-format|font-face-name|font-face-src|font-face-uri|foreignObject|g|glyph|glyphRef|hatch|hatchpath|hkern|image|line|linearGradient|marker|mask|mesh|meshgradient|meshpatch|meshrow|metadata|missing-glyph|mpath|path|pattern|polygon|polyline|radialGradient|rect|set|solidcolor|stop|switch|symbol|text|textPath|title|tref|tspan|unknown|use|view|vkern)$/;

function list ( items, conjunction = 'or' ) {
	if ( items.length === 1 ) return items[0];
	return `${items.slice( 0, -1 ).join( ', ' )} ${conjunction} ${items[ items.length - 1 ]}`;
}

export default function validateHtml ( validator, html ) {
	let elementDepth = 0;

	function visit ( node ) {
		if ( node.type === 'Element' ) {
			if ( elementDepth === 0 && validator.namespace !== namespaces.svg && svg.test( node.name ) ) {
				validator.warn( `<${node.name}> is an SVG element – did you forget to add { namespace: 'svg' } ?`, node.start );
			}

			elementDepth += 1;

			node.attributes.forEach( attribute => {
				if ( attribute.type === 'EventHandler' ) {
					const { callee, start, type } = attribute.expression;

					if ( type !== 'CallExpression' ) {
						validator.error( `Expected a call expression`, start );
					}

					const { name } = flattenReference( callee );

					if ( name === 'this' || name === 'event' ) return;
					if ( callee.type === 'Identifier' && callee.name === 'set' || callee.name === 'fire' || callee.name in validator.methods ) return;

					const validCallees = list( [ 'this.*', 'event.*', 'set', 'fire' ].concat( Object.keys( validator.methods ) ) );
					let message = `'${validator.source.slice( callee.start, callee.end )}' is an invalid callee (should be one of ${validCallees})`;

					if ( callee.type === 'Identifier' && callee.name in validator.helpers ) {
						message += `. '${callee.name}' exists on 'helpers', did you put it in the wrong place?`;
					}

					validator.error( message, start );
				}
			});
		}

		if ( node.children ) {
			node.children.forEach( visit );
		}

		if ( node.else ) {
			visit( node.else );
		}

		if ( node.type === 'Element' ) {
			elementDepth -= 1;
		}
	}

	html.children.forEach( visit );
}
