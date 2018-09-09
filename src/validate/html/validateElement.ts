import * as namespaces from '../../utils/namespaces';
import validateEventHandler from './validateEventHandler';
import { Node } from '../../interfaces';
import { dimensions } from '../../utils/patterns';
import isVoidElementName from '../../utils/isVoidElementName';
import isValidIdentifier from '../../utils/isValidIdentifier';
import Component from '../../compile/Component';

const svg = /^(?:altGlyph|altGlyphDef|altGlyphItem|animate|animateColor|animateMotion|animateTransform|circle|clipPath|color-profile|cursor|defs|desc|discard|ellipse|feBlend|feColorMatrix|feComponentTransfer|feComposite|feConvolveMatrix|feDiffuseLighting|feDisplacementMap|feDistantLight|feDropShadow|feFlood|feFuncA|feFuncB|feFuncG|feFuncR|feGaussianBlur|feImage|feMerge|feMergeNode|feMorphology|feOffset|fePointLight|feSpecularLighting|feSpotLight|feTile|feTurbulence|filter|font|font-face|font-face-format|font-face-name|font-face-src|font-face-uri|foreignObject|g|glyph|glyphRef|hatch|hatchpath|hkern|image|line|linearGradient|marker|mask|mesh|meshgradient|meshpatch|meshrow|metadata|missing-glyph|mpath|path|pattern|polygon|polyline|radialGradient|rect|set|solidcolor|stop|switch|symbol|text|textPath|tref|tspan|unknown|use|view|vkern)$/;

export default function validateElement(
	component: Component,
	node: Node,
	refs: Map<string, Node[]>,
	refCallees: Node[],
	stack: Node[],
	elementStack: Node[]
) {
	node.attributes.forEach((attribute: Node) => {
		if (attribute.type === 'Attribute') {
			if (attribute.name === 'value' && node.name === 'textarea') {
				if (node.children.length) {
					component.error(attribute, {
						code: `textarea-duplicate-value`,
						message: `A <textarea> can have either a value attribute or (equivalently) child content, but not both`
					});
				}
			}
		}
	});
}

function checkTypeAttribute(component: Component, node: Node) {
	const attribute = node.attributes.find(
		(attribute: Node) => attribute.name === 'type'
	);
	if (!attribute) return null;

	if (attribute.value === true) {
		component.error(attribute, {
			code: `missing-type`,
			message: `'type' attribute must be specified`
		});
	}

	if (isDynamic(attribute)) {
		component.error(attribute, {
			code: `invalid-type`,
			message: `'type' attribute cannot be dynamic if input uses two-way binding`
		});
	}

	return attribute.value[0].data;
}

function isDynamic(attribute: Node) {
	if (attribute.value === true) return false;
	return attribute.value.length > 1 || attribute.value[0].type !== 'Text';
}
