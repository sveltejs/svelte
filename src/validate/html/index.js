import * as namespaces from '../../utils/namespaces.js';

const svg = /^(?:altGlyph|altGlyphDef|altGlyphItem|animate|animateColor|animateMotion|animateTransform|circle|clipPath|color-profile|cursor|defs|desc|discard|ellipse|feBlend|feColorMatrix|feComponentTransfer|feComposite|feConvolveMatrix|feDiffuseLighting|feDisplacementMap|feDistantLight|feDropShadow|feFlood|feFuncA|feFuncB|feFuncG|feFuncR|feGaussianBlur|feImage|feMerge|feMergeNode|feMorphology|feOffset|fePointLight|feSpecularLighting|feSpotLight|feTile|feTurbulence|filter|font|font-face|font-face-format|font-face-name|font-face-src|font-face-uri|foreignObject|g|glyph|glyphRef|hatch|hatchpath|hkern|image|line|linearGradient|marker|mask|mesh|meshgradient|meshpatch|meshrow|metadata|missing-glyph|mpath|path|pattern|polygon|polyline|radialGradient|rect|set|solidcolor|stop|switch|symbol|text|textPath|title|tref|tspan|unknown|use|view|vkern)$/;

export default function validateHtml ( validator, html ) {
	let elementDepth = 0;

	function visit ( node ) {
		if ( node.type === 'Element' ) {
			if ( elementDepth === 0 && validator.namespace !== namespaces.svg && svg.test( node.name ) ) {
				validator.warn( `<${node.name}> is an SVG element – did you forget to add { namespace: 'svg' } ?`, node.start );
			}

			elementDepth += 1;
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
