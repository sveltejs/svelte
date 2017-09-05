import validateEventHandler from './validateEventHandler';
import { Validator } from '../index';
import { Node } from '../../interfaces';

export default function validateElement(validator: Validator, node: Node, refs: Map<string, Node[]>, refCallees: Node[]) {
	const isComponent =
		node.name === ':Self' || validator.components.has(node.name);

	if (!isComponent && /^[A-Z]/.test(node.name[0])) {
		// TODO upgrade to validator.error in v2
		validator.warn(`${node.name} component is not defined`, node.start);
	}

	if (node.name === 'slot') {
		const nameAttribute = node.attributes.find((attribute: Node) => attribute.name === 'name');
		if (nameAttribute) {
			if (nameAttribute.value.length !== 1 || nameAttribute.value[0].type !== 'Text') {
				validator.error(`<slot> name cannot be dynamic`, nameAttribute.start);
			}

			const slotName = nameAttribute.value[0].data;
			if (slotName === 'default') {
				validator.error(`default is a reserved word — it cannot be used as a slot name`, nameAttribute.start);
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
						attribute.start
					);
				}

				checkTypeAttribute(validator, node);
			} else if (name === 'checked') {
				if (node.name !== 'input') {
					validator.error(
						`'checked' is not a valid binding on <${node.name}> elements`,
						attribute.start
					);
				}

				if (checkTypeAttribute(validator, node) !== 'checkbox') {
					validator.error(
						`'checked' binding can only be used with <input type="checkbox">`,
						attribute.start
					);
				}
			} else if (name === 'group') {
				if (node.name !== 'input') {
					validator.error(
						`'group' is not a valid binding on <${node.name}> elements`,
						attribute.start
					);
				}

				const type = checkTypeAttribute(validator, node);

				if (type !== 'checkbox' && type !== 'radio') {
					validator.error(
						`'checked' binding can only be used with <input type="checkbox"> or <input type="radio">`,
						attribute.start
					);
				}
			} else if (
				name === 'currentTime' ||
				name === 'duration' ||
				name === 'paused' ||
				name === 'buffered' ||
				name === 'seekable' ||
				name === 'played'
			) {
				if (node.name !== 'audio' && node.name !== 'video') {
					validator.error(
						`'${name}' binding can only be used with <audio> or <video>`,
						attribute.start
					);
				}
			} else {
				validator.error(
					`'${attribute.name}' is not a valid binding`,
					attribute.start
				);
			}
		} else if (attribute.type === 'EventHandler') {
			validateEventHandler(validator, attribute, refCallees);
		} else if (attribute.type === 'Transition') {
			if (isComponent) {
				validator.error(`Transitions can only be applied to DOM elements, not components`, attribute.start);
			}

			const bidi = attribute.intro && attribute.outro;

			if (hasTransition) {
				if (bidi)
					validator.error(
						`An element can only have one 'transition' directive`,
						attribute.start
					);
				validator.error(
					`An element cannot have both a 'transition' directive and an '${attribute.intro
						? 'in'
						: 'out'}' directive`,
					attribute.start
				);
			}

			if ((hasIntro && attribute.intro) || (hasOutro && attribute.outro)) {
				if (bidi)
					validator.error(
						`An element cannot have both an '${hasIntro
							? 'in'
							: 'out'}' directive and a 'transition' directive`,
						attribute.start
					);
				validator.error(
					`An element can only have one '${hasIntro ? 'in' : 'out'}' directive`,
					attribute.start
				);
			}

			if (attribute.intro) hasIntro = true;
			if (attribute.outro) hasOutro = true;
			if (bidi) hasTransition = true;

			if (!validator.transitions.has(attribute.name)) {
				validator.error(
					`Missing transition '${attribute.name}'`,
					attribute.start
				);
			}
		} else if (attribute.type === 'Attribute') {
			if (attribute.name === 'value' && node.name === 'textarea') {
				if (node.children.length) {
					validator.error(
						`A <textarea> can have either a value attribute or (equivalently) child content, but not both`,
						attribute.start
					);
				}
			}

			if (attribute.name === 'slot' && !isComponent && isDynamic(attribute)) {
				validator.error(
					`slot attribute cannot have a dynamic value`,
					attribute.start
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
		validator.error(`'type' attribute must be specified`, attribute.start);
	}

	if (isDynamic(attribute)) {
		validator.error(
			`'type' attribute cannot be dynamic if input uses two-way binding`,
			attribute.start
		);
	}

	return attribute.value[0].data;
}

function isDynamic(attribute: Node) {
	return attribute.value.length > 1 || attribute.value[0].type !== 'Text';
}
