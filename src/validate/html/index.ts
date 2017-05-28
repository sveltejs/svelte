import * as namespaces from '../../utils/namespaces';
import validateElement from './validateElement';
import validateWindow from './validateWindow';
import { Validator } from '../index';
import { Node } from '../../interfaces';

const svg = /^(?:altGlyph|altGlyphDef|altGlyphItem|animate|animateColor|animateMotion|animateTransform|circle|clipPath|color-profile|cursor|defs|desc|discard|ellipse|feBlend|feColorMatrix|feComponentTransfer|feComposite|feConvolveMatrix|feDiffuseLighting|feDisplacementMap|feDistantLight|feDropShadow|feFlood|feFuncA|feFuncB|feFuncG|feFuncR|feGaussianBlur|feImage|feMerge|feMergeNode|feMorphology|feOffset|fePointLight|feSpecularLighting|feSpotLight|feTile|feTurbulence|filter|font|font-face|font-face-format|font-face-name|font-face-src|font-face-uri|foreignObject|g|glyph|glyphRef|hatch|hatchpath|hkern|image|line|linearGradient|marker|mask|mesh|meshgradient|meshpatch|meshrow|metadata|missing-glyph|mpath|path|pattern|polygon|polyline|radialGradient|rect|set|solidcolor|stop|switch|symbol|text|textPath|title|tref|tspan|unknown|use|view|vkern)$/;

const meta = new Map([
	[ ':Window', validateWindow ]
]);

export default function validateHtml ( validator: Validator, html: Node ) {
	let elementDepth = 0;

	function visit ( node: Node ) {
		if ( node.type === 'Element' ) {
			if ( elementDepth === 0 && validator.namespace !== namespaces.svg && svg.test( node.name ) ) {
				validator.warn( `<${node.name}> is an SVG element – did you forget to add { namespace: 'svg' } ?`, node.start );
			}

			if ( meta.has( node.name ) ) {
				return meta.get( node.name )( validator, node );
			}

			elementDepth += 1;

			validateElement( validator, node );
		} else if ( node.type === 'EachBlock' ) {
			if ( validator.helpers.has( node.context ) ) {
				let c = node.expression.end;

				// find start of context
				while ( /\s/.test( validator.source[c] ) ) c += 1;
				c += 2;
				while ( /\s/.test( validator.source[c] ) ) c += 1;

				validator.warn( `Context clashes with a helper. Rename one or the other to eliminate any ambiguity`, c );
			}
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
