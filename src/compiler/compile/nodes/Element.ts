import { is_void } from '../../utils/names';
import Node from './shared/Node';
import Attribute from './Attribute';
import Binding from './Binding';
import EventHandler from './EventHandler';
import Transition from './Transition';
import Animation from './Animation';
import Action from './Action';
import Class from './Class';
import Text from './Text';
import { namespaces } from '../../utils/namespaces';
import map_children from './shared/map_children';
import { dimensions } from '../../utils/patterns';
import list from '../../utils/list';
import Let from './Let';
import TemplateScope from './shared/TemplateScope';
import { INode } from './interfaces';
import validateA11y from '../utils/validate-a11y/Element';

const svg = /^(?:altGlyph|altGlyphDef|altGlyphItem|animate|animateColor|animateMotion|animateTransform|circle|clipPath|color-profile|cursor|defs|desc|discard|ellipse|feBlend|feColorMatrix|feComponentTransfer|feComposite|feConvolveMatrix|feDiffuseLighting|feDisplacementMap|feDistantLight|feDropShadow|feFlood|feFuncA|feFuncB|feFuncG|feFuncR|feGaussianBlur|feImage|feMerge|feMergeNode|feMorphology|feOffset|fePointLight|feSpecularLighting|feSpotLight|feTile|feTurbulence|filter|font|font-face|font-face-format|font-face-name|font-face-src|font-face-uri|foreignObject|g|glyph|glyphRef|hatch|hatchpath|hkern|image|line|linearGradient|marker|mask|mesh|meshgradient|meshpatch|meshrow|metadata|missing-glyph|mpath|path|pattern|polygon|polyline|radialGradient|rect|set|solidcolor|stop|svg|switch|symbol|text|textPath|tref|tspan|unknown|use|view|vkern)$/;

const valid_modifiers = new Set([
	'preventDefault',
	'stopPropagation',
	'capture',
	'once',
	'passive',
	'self'
]);

const passive_events = new Set([
	'wheel',
	'touchstart',
	'touchmove',
	'touchend',
	'touchcancel'
]);

function get_namespace(parent: Element, element: Element, explicit_namespace: string) {
	const parent_element = parent.find_nearest(/^Element/);

	if (!parent_element) {
		return explicit_namespace || (svg.test(element.name)
			? namespaces.svg
			: null);
	}

	if (svg.test(element.name.toLowerCase())) return namespaces.svg;
	if (parent_element.name.toLowerCase() === 'foreignobject') return null;

	return parent_element.namespace;
}

export default class Element extends Node {
	type: 'Element';
	name: string;
	scope: TemplateScope;
	attributes: Attribute[] = [];
	actions: Action[] = [];
	bindings: Binding[] = [];
	classes: Class[] = [];
	handlers: EventHandler[] = [];
	lets: Let[] = [];
	intro?: Transition = null;
	outro?: Transition = null;
	animation?: Animation = null;
	children: INode[];
	namespace: string;

	constructor(component, parent, scope, info: any) {
		super(component, parent, scope, info);
		this.name = info.name;

		this.namespace = get_namespace(parent, this, component.namespace);

		if (this.name === 'textarea') {
			if (info.children.length > 0) {
				const value_attribute = info.attributes.find(node => node.name === 'value');
				if (value_attribute) {
					component.error(value_attribute, {
						code: `textarea-duplicate-value`,
						message: `A <textarea> can have either a value attribute or (equivalently) child content, but not both`
					});
				}

				// this is an egregious hack, but it's the easiest way to get <textarea>
				// children treated the same way as a value attribute
				info.attributes.push({
					type: 'Attribute',
					name: 'value',
					value: info.children
				});

				info.children = [];
			}
		}

		if (this.name === 'option') {
			// Special case — treat these the same way:
			//   <option>{foo}</option>
			//   <option value={foo}>{foo}</option>
			const value_attribute = info.attributes.find(attribute => attribute.name === 'value');

			if (!value_attribute) {
				info.attributes.push({
					type: 'Attribute',
					name: 'value',
					value: info.children,
					synthetic: true
				});
			}
		}

		info.attributes.forEach(node => {
			switch (node.type) {
				case 'Action':
					this.actions.push(new Action(component, this, scope, node));
					break;

				case 'Attribute':
				case 'Spread':
					// special case
					if (node.name === 'xmlns') this.namespace = node.value[0].data;

					this.attributes.push(new Attribute(component, this, scope, node));
					break;

				case 'Binding':
					this.bindings.push(new Binding(component, this, scope, node));
					break;

				case 'Class':
					this.classes.push(new Class(component, this, scope, node));
					break;

				case 'EventHandler':
					this.handlers.push(new EventHandler(component, this, scope, node));
					break;

				case 'Let':
					this.lets.push(new Let(component, this, scope, node));
					break;

				case 'Transition':
				{
					const transition = new Transition(component, this, scope, node);
					if (node.intro) this.intro = transition;
					if (node.outro) this.outro = transition;
					break;
				}

				case 'Animation':
					this.animation = new Animation(component, this, scope, node);
					break;

				default:
					throw new Error(`Not implemented: ${node.type}`);
			}
		});

		if (this.lets.length > 0) {
			this.scope = scope.child();

			this.lets.forEach(l => {
				const dependencies = new Set([l.name.name]);

				l.names.forEach(name => {
					this.scope.add(name, dependencies, this);
				});
			});
		} else {
			this.scope = scope;
		}

		this.children = map_children(component, this, this.scope, info.children);

		this.validate();

		component.stylesheet.apply(this);
	}

	validate() {
		validateA11y(this);

		this.validate_attributes();
		this.validate_bindings();
		this.validate_content();
		this.validate_event_handlers();
	}

	validate_attributes() {
		const { component } = this;

		this.attributes.forEach(attribute => {
			if (attribute.is_spread) return;

			const name = attribute.name.toLowerCase();

			if (name === 'slot') {
				if (!attribute.is_static) {
					component.error(attribute, {
						code: `invalid-slot-attribute`,
						message: `slot attribute cannot have a dynamic value`
					});
				}

				if (component.slot_outlets.has(name)) {
					component.error(attribute, {
						code: `duplicate-slot-attribute`,
						message: `Duplicate '${name}' slot`
					});

					component.slot_outlets.add(name);
				}

				let ancestor = this.parent;
				do {
					if (ancestor.type === 'InlineComponent') break;
					if (ancestor.type === 'Element' && /-/.test(ancestor.name)) break;

					if (ancestor.type === 'IfBlock' || ancestor.type === 'EachBlock') {
						const type = ancestor.type === 'IfBlock' ? 'if' : 'each';
						const message = `Cannot place slotted elements inside an ${type}-block`;

						component.error(attribute, {
							code: `invalid-slotted-content`,
							message
						});
					}
				} while (ancestor = ancestor.parent);

				if (!ancestor) {
					component.error(attribute, {
						code: `invalid-slotted-content`,
						message: `Element with a slot='...' attribute must be a descendant of a component or custom element`
					});
				}
			}

			if (name === 'is') {
				component.warn(attribute, {
					code: 'avoid-is',
					message: `The 'is' attribute is not supported cross-browser and should be avoided`
				});
			}
		});
	}

	validate_bindings() {
		const { component } = this;

		const check_type_attribute = () => {
			const attribute = this.attributes.find(
				(attribute: Attribute) => attribute.name === 'type'
			);

			if (!attribute) return null;

			if (!attribute.is_static) {
				component.error(attribute, {
					code: `invalid-type`,
					message: `'type' attribute cannot be dynamic if input uses two-way binding`
				});
			}

			const value = attribute.get_static_value();

			if (value === true) {
				component.error(attribute, {
					code: `missing-type`,
					message: `'type' attribute must be specified`
				});
			}

			return value;
		};

		this.bindings.forEach(binding => {
			const { name } = binding;

			if (name === 'value') {
				if (
					this.name !== 'input' &&
					this.name !== 'textarea' &&
					this.name !== 'select'
				) {
					component.error(binding, {
						code: `invalid-binding`,
						message: `'value' is not a valid binding on <${this.name}> elements`
					});
				}

				if (this.name === 'select') {
					const attribute = this.attributes.find(
						(attribute: Attribute) => attribute.name === 'multiple'
					);

					if (attribute && !attribute.is_static) {
						component.error(attribute, {
							code: `dynamic-multiple-attribute`,
							message: `'multiple' attribute cannot be dynamic if select uses two-way binding`
						});
					}
				} else {
					check_type_attribute();
				}
			} else if (name === 'checked' || name === 'indeterminate') {
				if (this.name !== 'input') {
					component.error(binding, {
						code: `invalid-binding`,
						message: `'${name}' is not a valid binding on <${this.name}> elements`
					});
				}

				const type = check_type_attribute();

				if (type !== 'checkbox') {
					let message = `'${name}' binding can only be used with <input type="checkbox">`;
					if (type === 'radio') message += ` — for <input type="radio">, use 'group' binding`;
					component.error(binding, { code: `invalid-binding`, message });
				}
			} else if (name === 'group') {
				if (this.name !== 'input') {
					component.error(binding, {
						code: `invalid-binding`,
						message: `'group' is not a valid binding on <${this.name}> elements`
					});
				}

				const type = check_type_attribute();

				if (type !== 'checkbox' && type !== 'radio') {
					component.error(binding, {
						code: `invalid-binding`,
						message: `'group' binding can only be used with <input type="checkbox"> or <input type="radio">`
					});
				}
			} else if (name === 'files') {
				if (this.name !== 'input') {
					component.error(binding, {
						code: `invalid-binding`,
						message: `'files' is not a valid binding on <${this.name}> elements`
					});
				}

				const type = check_type_attribute();

				if (type !== 'file') {
					component.error(binding, {
						code: `invalid-binding`,
						message: `'files' binding can only be used with <input type="file">`
					});
				}
			} else if (name === 'open') {
				if (this.name !== 'details') {
					component.error(binding, {
						code: `invalid-binding`,
						message: `'${name}' binding can only be used with <details>`
					});
				}
			} else if (
				name === 'currentTime' ||
				name === 'duration' ||
				name === 'paused' ||
				name === 'buffered' ||
				name === 'seekable' ||
				name === 'played' ||
				name === 'volume' ||
				name === 'playbackRate'
			) {
				if (this.name !== 'audio' && this.name !== 'video') {
					component.error(binding, {
						code: `invalid-binding`,
						message: `'${name}' binding can only be used with <audio> or <video>`
					});
				}
			} else if (dimensions.test(name)) {
				if (this.name === 'svg' && (name === 'offsetWidth' || name === 'offsetHeight')) {
					component.error(binding, {
						code: 'invalid-binding',
						message: `'${binding.name}' is not a valid binding on <svg>. Use '${name.replace('offset', 'client')}' instead`
					});
				} else if (svg.test(this.name)) {
					component.error(binding, {
						code: 'invalid-binding',
						message: `'${binding.name}' is not a valid binding on SVG elements`
					});
				} else if (is_void(this.name)) {
					component.error(binding, {
						code: 'invalid-binding',
						message: `'${binding.name}' is not a valid binding on void elements like <${this.name}>. Use a wrapper element instead`
					});
				}
			} else if (
				name === 'textContent' ||
				name === 'innerHTML'
			) {
				const contenteditable = this.attributes.find(
					(attribute: Attribute) => attribute.name === 'contenteditable'
				);

				if (!contenteditable) {
					component.error(binding, {
						code: `missing-contenteditable-attribute`,
						message: `'contenteditable' attribute is required for textContent and innerHTML two-way bindings`
					});
				} else if (contenteditable && !contenteditable.is_static) {
					component.error(contenteditable, {
						code: `dynamic-contenteditable-attribute`,
						message: `'contenteditable' attribute cannot be dynamic if element uses two-way binding`
					});
				}
			} else if (name !== 'this') {
				component.error(binding, {
					code: `invalid-binding`,
					message: `'${binding.name}' is not a valid binding`
				});
			}
		});
	}

	validate_content() {}

	validate_event_handlers() {
		const { component } = this;

		this.handlers.forEach(handler => {
			if (handler.modifiers.has('passive') && handler.modifiers.has('preventDefault')) {
				component.error(handler, {
					code: 'invalid-event-modifier',
					message: `The 'passive' and 'preventDefault' modifiers cannot be used together`
				});
			}

			handler.modifiers.forEach(modifier => {
				if (!valid_modifiers.has(modifier)) {
					component.error(handler, {
						code: 'invalid-event-modifier',
						message: `Valid event modifiers are ${list(Array.from(valid_modifiers))}`
					});
				}

				if (modifier === 'passive') {
					if (passive_events.has(handler.name)) {
						if (handler.can_make_passive) {
							component.warn(handler, {
								code: 'redundant-event-modifier',
								message: `Touch event handlers that don't use the 'event' object are passive by default`
							});
						}
					} else {
						component.warn(handler, {
							code: 'redundant-event-modifier',
							message: `The passive modifier only works with wheel and touch events`,
						});
					}
				}

				if (component.compile_options.legacy && (modifier === 'once' || modifier === 'passive')) {
					// TODO this could be supported, but it would need a few changes to
					// how event listeners work
					component.error(handler, {
						code: 'invalid-event-modifier',
						message: `The '${modifier}' modifier cannot be used in legacy mode`
					});
				}
			});

			if (passive_events.has(handler.name) && handler.can_make_passive && !handler.modifiers.has('preventDefault')) {
				// touch/wheel events should be passive by default
				handler.modifiers.add('passive');
			}
		});
	}

	is_media_node() {
		return this.name === 'audio' || this.name === 'video';
	}

	add_css_class() {
		const { id } = this.component.stylesheet;

		const class_attribute = this.attributes.find(a => a.name === 'class');

		if (class_attribute && !class_attribute.is_true) {
			if (class_attribute.chunks.length === 1 && class_attribute.chunks[0].type === 'Text') {
				(class_attribute.chunks[0] as Text).data += ` ${id}`;
			} else {
				(class_attribute.chunks as Node[]).push(
					new Text(this.component, this, this.scope, {
						type: 'Text',
						data: ` ${id}`,
						synthetic: true
					})
				);
			}
		} else {
			this.attributes.push(
				new Attribute(this.component, this, this.scope, {
					type: 'Attribute',
					name: 'class',
					value: [{ type: 'Text', data: id, synthetic: true }]
				})
			);
		}
	}
}
