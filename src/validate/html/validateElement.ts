import * as namespaces from '../../utils/namespaces';
import validateEventHandler from './validateEventHandler';
import validate, { Validator } from '../index';
import { Node } from '../../interfaces';

const svg = /^(?:altGlyph|altGlyphDef|altGlyphItem|animate|animateColor|animateMotion|animateTransform|circle|clipPath|color-profile|cursor|defs|desc|discard|ellipse|feBlend|feColorMatrix|feComponentTransfer|feComposite|feConvolveMatrix|feDiffuseLighting|feDisplacementMap|feDistantLight|feDropShadow|feFlood|feFuncA|feFuncB|feFuncG|feFuncR|feGaussianBlur|feImage|feMerge|feMergeNode|feMorphology|feOffset|fePointLight|feSpecularLighting|feSpotLight|feTile|feTurbulence|filter|font|font-face|font-face-format|font-face-name|font-face-src|font-face-uri|foreignObject|g|glyph|glyphRef|hatch|hatchpath|hkern|image|line|linearGradient|marker|mask|mesh|meshgradient|meshpatch|meshrow|metadata|missing-glyph|mpath|path|pattern|polygon|polyline|radialGradient|rect|set|solidcolor|stop|switch|symbol|text|textPath|tref|tspan|unknown|use|view|vkern)$/;

export default function validateElement(
	validator: Validator,
	node: Node,
	refs: Map<string, Node[]>,
	refCallees: Node[],
	stack: Node[],
	elementStack: Node[],
	isComponent: Boolean
) {
	if (isComponent) {
		validator.used.components.add(node.name);
	}

	if (!isComponent && /^[A-Z]/.test(node.name[0])) {
		// TODO upgrade to validator.error in v2
		validator.warn(node, {
			code: `missing-component`,
			message: `${node.name} component is not defined`
		});
	}

	if (elementStack.length === 0 && validator.namespace !== namespaces.svg && svg.test(node.name)) {
		validator.warn(node, {
			code: `missing-namespace`,
			message: `<${node.name}> is an SVG element – did you forget to add { namespace: 'svg' } ?`
		});
	}

	if (node.name === 'slot') {
		const nameAttribute = node.attributes.find((attribute: Node) => attribute.name === 'name');
		if (nameAttribute) {
			if (nameAttribute.value.length !== 1 || nameAttribute.value[0].type !== 'Text') {
				validator.error(`<slot> name cannot be dynamic`, nameAttribute);
			}

			const slotName = nameAttribute.value[0].data;
			if (slotName === 'default') {
				validator.error(`default is a reserved word — it cannot be used as a slot name`, nameAttribute);
			}

			// TODO should duplicate slots be disallowed? Feels like it's more likely to be a
			// bug than anything. Perhaps it should be a warning

			// if (validator.slots.has(slotName)) {
			// 	validator.error(`duplicate '${slotName}' <slot> element`, nameAttribute.start);
			// }

			// validator.slots.add(slotName);
		} else {
			// if (validator.slots.has('default')) {
			// 	validator.error(`duplicate default <slot> element`, node.start);
			// }

			// validator.slots.add('default');
		}
	}

	if (node.name === 'title') {
		if (node.attributes.length > 0) {
			validator.error(
				`<title> cannot have attributes`,
				node.attributes[0]
			);
		}

		node.children.forEach(child => {
			if (child.type !== 'Text' && child.type !== 'MustacheTag') {
				validator.error(
					`<title> can only contain text and {{tags}}`,
					child
				);
			}
		});
	}

	let hasIntro: boolean;
	let hasOutro: boolean;
	let hasTransition: boolean;

	node.attributes.forEach((attribute: Node) => {
		if (attribute.type === 'Ref') {
			if (!refs.has(attribute.name)) refs.set(attribute.name, []);
			refs.get(attribute.name).push(node);
		}

		if (!isComponent && attribute.type === 'Binding') {
			const { name } = attribute;

			if (name === 'value') {
				if (
					node.name !== 'input' &&
					node.name !== 'textarea' &&
					node.name !== 'select'
				) {
					validator.error(
						`'value' is not a valid binding on <${node.name}> elements`,
						attribute
					);
				}

				if (node.name === 'select') {
					const attribute = node.attributes.find(
						(attribute: Node) => attribute.name === 'multiple'
					);

					if (attribute && isDynamic(attribute)) {
						validator.error(
							`'multiple' attribute cannot be dynamic if select uses two-way binding`,
							attribute
						);
					}
				} else {
					checkTypeAttribute(validator, node);
				}
			} else if (name === 'checked' || name === 'indeterminate') {
				if (node.name !== 'input') {
					validator.error(
						`'${name}' is not a valid binding on <${node.name}> elements`,
						attribute
					);
				}

				if (checkTypeAttribute(validator, node) !== 'checkbox') {
					validator.error(
						`'${name}' binding can only be used with <input type="checkbox">`,
						attribute
					);
				}
			} else if (name === 'group') {
				if (node.name !== 'input') {
					validator.error(
						`'group' is not a valid binding on <${node.name}> elements`,
						attribute
					);
				}

				const type = checkTypeAttribute(validator, node);

				if (type !== 'checkbox' && type !== 'radio') {
					validator.error(
						`'checked' binding can only be used with <input type="checkbox"> or <input type="radio">`,
						attribute
					);
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
					validator.error(
						`'${name}' binding can only be used with <audio> or <video>`,
						attribute
					);
				}
			} else {
				validator.error(
					`'${attribute.name}' is not a valid binding`,
					attribute
				);
			}
		} else if (attribute.type === 'EventHandler') {
			validator.used.events.add(attribute.name);
			validateEventHandler(validator, attribute, refCallees);
		} else if (attribute.type === 'Transition') {
			if (isComponent) {
				validator.error(`Transitions can only be applied to DOM elements, not components`, attribute);
			}

			validator.used.transitions.add(attribute.name);

			const bidi = attribute.intro && attribute.outro;

			if (hasTransition) {
				if (bidi)
					validator.error(
						`An element can only have one 'transition' directive`,
						attribute
					);
				validator.error(
					`An element cannot have both a 'transition' directive and an '${attribute.intro
						? 'in'
						: 'out'}' directive`,
					attribute
				);
			}

			if ((hasIntro && attribute.intro) || (hasOutro && attribute.outro)) {
				if (bidi)
					validator.error(
						`An element cannot have both an '${hasIntro
							? 'in'
							: 'out'}' directive and a 'transition' directive`,
						attribute
					);
				validator.error(
					`An element can only have one '${hasIntro ? 'in' : 'out'}' directive`,
					attribute
				);
			}

			if (attribute.intro) hasIntro = true;
			if (attribute.outro) hasOutro = true;
			if (bidi) hasTransition = true;

			if (!validator.transitions.has(attribute.name)) {
				validator.error(
					`Missing transition '${attribute.name}'`,
					attribute
				);
			}
		} else if (attribute.type === 'Attribute') {
			if (attribute.name === 'value' && node.name === 'textarea') {
				if (node.children.length) {
					validator.error(
						`A <textarea> can have either a value attribute or (equivalently) child content, but not both`,
						attribute
					);
				}
			}

			if (attribute.name === 'slot' && !isComponent) {
				checkSlotAttribute(validator, node, attribute, stack);
			}
		} else if (attribute.type === 'Action') {
			if (isComponent) {
				validator.error(`Actions can only be applied to DOM elements, not components`, attribute);
			}

			validator.used.actions.add(attribute.name);

			if (!validator.actions.has(attribute.name)) {
				validator.error(
					`Missing action '${attribute.name}'`,
					attribute
				);
			}
		}
	});
}

function checkTypeAttribute(validator: Validator, node: Node) {
	const attribute = node.attributes.find(
		(attribute: Node) => attribute.name === 'type'
	);
	if (!attribute) return null;

	if (attribute.value === true) {
		validator.error(`'type' attribute must be specified`, attribute);
	}

	if (isDynamic(attribute)) {
		validator.error(
			`'type' attribute cannot be dynamic if input uses two-way binding`,
			attribute
		);
	}

	return attribute.value[0].data;
}

function checkSlotAttribute(validator: Validator, node: Node, attribute: Node, stack: Node[]) {
	if (isDynamic(attribute)) {
		validator.error(
			`slot attribute cannot have a dynamic value`,
			attribute
		);
	}

	let i = stack.length;
	while (i--) {
		const parent = stack[i];
		if (parent.type === 'Element') {
			// if we're inside a component or a custom element, gravy
			if (parent.name === ':Self' || parent.name === ':Component' || parent.name === 'svelte:self' || parent.name === 'svelte:component' || validator.components.has(parent.name)) return;
			if (/-/.test(parent.name)) return;
		}

		if (parent.type === 'IfBlock' || parent.type === 'EachBlock') {
			const message = `Cannot place slotted elements inside an ${parent.type === 'IfBlock' ? 'if' : 'each'}-block`;
			validator.error(message, attribute);
		}
	}

	validator.error(`Element with a slot='...' attribute must be a descendant of a component or custom element`, attribute);
}

function isDynamic(attribute: Node) {
	if (attribute.value === true) return false;
	return attribute.value.length > 1 || attribute.value[0].type !== 'Text';
}
