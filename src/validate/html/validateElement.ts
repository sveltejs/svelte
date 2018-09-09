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
	if (elementStack.length === 0 && component.namespace !== namespaces.svg && svg.test(node.name)) {
		component.warn(node, {
			code: `missing-namespace`,
			message: `<${node.name}> is an SVG element – did you forget to add { namespace: 'svg' } ?`
		});
	}

	let hasAnimation: boolean;

	node.attributes.forEach((attribute: Node) => {
		if (attribute.type === 'Binding') {
			const { name } = attribute;

			if (name === 'value') {
				if (
					node.name !== 'input' &&
					node.name !== 'textarea' &&
					node.name !== 'select'
				) {
					component.error(attribute, {
						code: `invalid-binding`,
						message: `'value' is not a valid binding on <${node.name}> elements`
					});
				}

				if (node.name === 'select') {
					const attribute = node.attributes.find(
						(attribute: Node) => attribute.name === 'multiple'
					);

					if (attribute && isDynamic(attribute)) {
						component.error(attribute, {
							code: `dynamic-multiple-attribute`,
							message: `'multiple' attribute cannot be dynamic if select uses two-way binding`
						});
					}
				} else {
					checkTypeAttribute(component, node);
				}
			} else if (name === 'checked' || name === 'indeterminate') {
				if (node.name !== 'input') {
					component.error(attribute, {
						code: `invalid-binding`,
						message: `'${name}' is not a valid binding on <${node.name}> elements`
					});
				}

				if (checkTypeAttribute(component, node) !== 'checkbox') {
					component.error(attribute, {
						code: `invalid-binding`,
						message: `'${name}' binding can only be used with <input type="checkbox">`
					});
				}
			} else if (name === 'group') {
				if (node.name !== 'input') {
					component.error(attribute, {
						code: `invalid-binding`,
						message: `'group' is not a valid binding on <${node.name}> elements`
					});
				}

				const type = checkTypeAttribute(component, node);

				if (type !== 'checkbox' && type !== 'radio') {
					component.error(attribute, {
						code: `invalid-binding`,
						message: `'checked' binding can only be used with <input type="checkbox"> or <input type="radio">`
					});
				}
			} else if (name == 'files') {
				if (node.name !== 'input') {
					component.error(attribute, {
						code: `invalid-binding`,
						message: `'files' binding acn only be used with <input type="file">`
					});
				}

				const type = checkTypeAttribute(component, node);

				if (type !== 'file') {
					component.error(attribute, {
						code: `invalid-binding`,
						message: `'files' binding can only be used with <input type="file">`
					});
				}
			} else if (
				name === 'currentTime' ||
				name === 'duration' ||
				name === 'paused' ||
				name === 'buffered' ||
				name === 'seekable' ||
				name === 'played' ||
				name === 'volume'
			) {
				if (node.name !== 'audio' && node.name !== 'video') {
					component.error(attribute, {
						code: `invalid-binding`,
						message: `'${name}' binding can only be used with <audio> or <video>`
					});
				}
			} else if (dimensions.test(name)) {
				if (node.name === 'svg' && (name === 'offsetWidth' || name === 'offsetHeight')) {
					component.error(attribute, {
						code: 'invalid-binding',
						message: `'${attribute.name}' is not a valid binding on <svg>. Use '${name.replace('offset', 'client')}' instead`
					});
				} else if (svg.test(node.name)) {
					component.error(attribute, {
						code: 'invalid-binding',
						message: `'${attribute.name}' is not a valid binding on SVG elements`
					});
				} else if (isVoidElementName(node.name)) {
					component.error(attribute, {
						code: 'invalid-binding',
						message: `'${attribute.name}' is not a valid binding on void elements like <${node.name}>. Use a wrapper element instead`
					});
				}
			} else {
				component.error(attribute, {
					code: `invalid-binding`,
					message: `'${attribute.name}' is not a valid binding`
				});
			}
		} else if (attribute.type === 'Attribute') {
			if (attribute.name === 'value' && node.name === 'textarea') {
				if (node.children.length) {
					component.error(attribute, {
						code: `textarea-duplicate-value`,
						message: `A <textarea> can have either a value attribute or (equivalently) child content, but not both`
					});
				}
			}

			if (attribute.name === 'slot') {
				checkSlotAttribute(component, node, attribute, stack);
			}
		} else if (attribute.type === 'Action') {
			component.used.actions.add(attribute.name);

			if (!component.actions.has(attribute.name)) {
				component.error(attribute, {
					code: `missing-action`,
					message: `Missing action '${attribute.name}'`
				});
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

function checkSlotAttribute(component: Component, node: Node, attribute: Node, stack: Node[]) {
	if (isDynamic(attribute)) {
		component.error(attribute, {
			code: `invalid-slot-attribute`,
			message: `slot attribute cannot have a dynamic value`
		});
	}

	let i = stack.length;
	while (i--) {
		const parent = stack[i];

		if (parent.type === 'InlineComponent') {
			// if we're inside a component or a custom element, gravy
			if (parent.name === 'svelte:self' || parent.name === 'svelte:component' || component.components.has(parent.name)) return;
		} else if (parent.type === 'Element') {
			if (/-/.test(parent.name)) return;
		}

		if (parent.type === 'IfBlock' || parent.type === 'EachBlock') {
			const message = `Cannot place slotted elements inside an ${parent.type === 'IfBlock' ? 'if' : 'each'}-block`;
			component.error(attribute, {
				code: `invalid-slotted-content`,
				message
			});
		}
	}

	component.error(attribute, {
		code: `invalid-slotted-content`,
		message: `Element with a slot='...' attribute must be a descendant of a component or custom element`
	});
}

function isDynamic(attribute: Node) {
	if (attribute.value === true) return false;
	return attribute.value.length > 1 || attribute.value[0].type !== 'Text';
}
