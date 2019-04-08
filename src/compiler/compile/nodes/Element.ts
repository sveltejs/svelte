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
import fuzzymatch from '../../utils/fuzzymatch';
import list from '../../utils/list';
import Let from './Let';
import TemplateScope from './shared/TemplateScope';
import { INode } from './interfaces';

const svg = /^(?:altGlyph|altGlyphDef|altGlyphItem|animate|animateColor|animateMotion|animateTransform|circle|clipPath|color-profile|cursor|defs|desc|discard|ellipse|feBlend|feColorMatrix|feComponentTransfer|feComposite|feConvolveMatrix|feDiffuseLighting|feDisplacementMap|feDistantLight|feDropShadow|feFlood|feFuncA|feFuncB|feFuncG|feFuncR|feGaussianBlur|feImage|feMerge|feMergeNode|feMorphology|feOffset|fePointLight|feSpecularLighting|feSpotLight|feTile|feTurbulence|filter|font|font-face|font-face-format|font-face-name|font-face-src|font-face-uri|foreignObject|g|glyph|glyphRef|hatch|hatchpath|hkern|image|line|linearGradient|marker|mask|mesh|meshgradient|meshpatch|meshrow|metadata|missing-glyph|mpath|path|pattern|polygon|polyline|radialGradient|rect|set|solidcolor|stop|svg|switch|symbol|text|textPath|tref|tspan|unknown|use|view|vkern)$/;

const aria_attributes = 'activedescendant atomic autocomplete busy checked colindex controls current describedby details disabled dropeffect errormessage expanded flowto grabbed haspopup hidden invalid keyshortcuts label labelledby level live modal multiline multiselectable orientation owns placeholder posinset pressed readonly relevant required roledescription rowindex selected setsize sort valuemax valuemin valuenow valuetext'.split(' ');
const aria_attribute_set = new Set(aria_attributes);

const aria_roles = 'alert alertdialog application article banner button cell checkbox columnheader combobox command complementary composite contentinfo definition dialog directory document feed figure form grid gridcell group heading img input landmark link list listbox listitem log main marquee math menu menubar menuitem menuitemcheckbox menuitemradio navigation none note option presentation progressbar radio radiogroup range region roletype row rowgroup rowheader scrollbar search searchbox section sectionhead select separator slider spinbutton status structure switch tab table tablist tabpanel term textbox timer toolbar tooltip tree treegrid treeitem widget window'.split(' ');
const aria_role_set = new Set(aria_roles);

const a11y_required_attributes = {
	a: ['href'],
	area: ['alt', 'aria-label', 'aria-labelledby'],

	// html-has-lang
	html: ['lang'],

	// iframe-has-title
	iframe: ['title'],
	img: ['alt'],
	object: ['title', 'aria-label', 'aria-labelledby']
};

const a11y_distracting_elements = new Set([
	'blink',
	'marquee'
]);

const a11y_required_content = new Set([
	// anchor-has-content
	'a',

	// heading-has-content
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6'
])

const invisible_elements = new Set(['meta', 'html', 'script', 'style']);

const valid_modifiers = new Set([
	'preventDefault',
	'stopPropagation',
	'capture',
	'once',
	'passive'
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

	if (element.name.toLowerCase() === 'svg') return namespaces.svg;
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
					const transition = new Transition(component, this, scope, node);
					if (node.intro) this.intro = transition;
					if (node.outro) this.outro = transition;
					break;

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
				const dependencies = new Set([l.name]);

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
		if (a11y_distracting_elements.has(this.name)) {
			// no-distracting-elements
			this.component.warn(this, {
				code: `a11y-distracting-elements`,
				message: `A11y: Avoid <${this.name}> elements`
			});
		}

		if (this.name === 'figcaption') {
			let { parent } = this;
			let is_figure_parent = false;

			while (parent) {
				if ((parent as Element).name === 'figure') {
					is_figure_parent = true;
					break;
				}
				if (parent.type === 'Element') {
					break;
				}
				parent = parent.parent;
			}

			if (!is_figure_parent) {
				this.component.warn(this, {
					code: `a11y-structure`,
					message: `A11y: <figcaption> must be an immediate child of <figure>`
				});
			}
		}

		if (this.name === 'figure') {
			const children = this.children.filter(node => {
				if (node.type === 'Comment') return false;
				if (node.type === 'Text') return /\S/.test(node.data);
				return true;
			});

			const index = children.findIndex(child => (child as Element).name === 'figcaption');

			if (index !== -1 && (index !== 0 && index !== children.length - 1)) {
				this.component.warn(children[index], {
					code: `a11y-structure`,
					message: `A11y: <figcaption> must be first or last child of <figure>`
				});
			}
		}

		this.validate_attributes();
		this.validate_bindings();
		this.validate_content();
		this.validate_event_handlers();
	}

	validate_attributes() {
		const { component } = this;

		const attribute_map = new Map();

		this.attributes.forEach(attribute => {
			if (attribute.is_spread) return;

			const name = attribute.name.toLowerCase();

			// aria-props
			if (name.startsWith('aria-')) {
				if (invisible_elements.has(this.name)) {
					// aria-unsupported-elements
					component.warn(attribute, {
						code: `a11y-aria-attributes`,
						message: `A11y: <${this.name}> should not have aria-* attributes`
					});
				}

				const type = name.slice(5);
				if (!aria_attribute_set.has(type)) {
					const match = fuzzymatch(type, aria_attributes);
					let message = `A11y: Unknown aria attribute 'aria-${type}'`;
					if (match) message += ` (did you mean '${match}'?)`;

					component.warn(attribute, {
						code: `a11y-unknown-aria-attribute`,
						message
					});
				}

				if (name === 'aria-hidden' && /^h[1-6]$/.test(this.name)) {
					component.warn(attribute, {
						code: `a11y-hidden`,
						message: `A11y: <${this.name}> element should not be hidden`
					});
				}
			}

			// aria-role
			if (name === 'role') {
				if (invisible_elements.has(this.name)) {
					// aria-unsupported-elements
					component.warn(attribute, {
						code: `a11y-misplaced-role`,
						message: `A11y: <${this.name}> should not have role attribute`
					});
				}

				const value = attribute.get_static_value();
				// @ts-ignore
				if (value && !aria_role_set.has(value)) {
					// @ts-ignore
					const match = fuzzymatch(value, aria_roles);
					let message = `A11y: Unknown role '${value}'`;
					if (match) message += ` (did you mean '${match}'?)`;

					component.warn(attribute, {
						code: `a11y-unknown-role`,
						message
					});
				}
			}

			// no-access-key
			if (name === 'accesskey') {
				component.warn(attribute, {
					code: `a11y-accesskey`,
					message: `A11y: Avoid using accesskey`
				});
			}

			// no-autofocus
			if (name === 'autofocus') {
				component.warn(attribute, {
					code: `a11y-autofocus`,
					message: `A11y: Avoid using autofocus`
				});
			}

			// scope
			if (name === 'scope' && this.name !== 'th') {
				component.warn(attribute, {
					code: `a11y-misplaced-scope`,
					message: `A11y: The scope attribute should only be used with <th> elements`
				});
			}

			// tabindex-no-positive
			if (name === 'tabindex') {
				const value = attribute.get_static_value();
				// @ts-ignore todo is tabindex=true correct case?
				if (!isNaN(value) && +value > 0) {
					component.warn(attribute, {
						code: `a11y-positive-tabindex`,
						message: `A11y: avoid tabindex values above zero`
					});
				}
			}

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

			attribute_map.set(attribute.name, attribute);
		});

		// handle special cases
		if (this.name === 'a') {
			const attribute = attribute_map.get('href') || attribute_map.get('xlink:href');

			if (attribute) {
				const value = attribute.get_static_value();

				if (value === '' || value === '#') {
					component.warn(attribute, {
						code: `a11y-invalid-attribute`,
						message: `A11y: '${value}' is not a valid ${attribute.name} attribute`
					});
				}
			} else {
				component.warn(this, {
					code: `a11y-missing-attribute`,
					message: `A11y: <a> element should have an href attribute`
				});
			}
		}

		else {
			const required_attributes = a11y_required_attributes[this.name];
			if (required_attributes) {
				const has_attribute = required_attributes.some(name => attribute_map.has(name));

				if (!has_attribute) {
					should_have_attribute(this, required_attributes);
				}
			}

			if (this.name === 'input') {
				const type = attribute_map.get('type');
				if (type && type.get_static_value() === 'image') {
					should_have_attribute(
						this,
						['alt', 'aria-label', 'aria-labelledby'],
						'input type="image"'
					);
				}
			}
		}
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
				name === 'text' ||
				name === 'html'
			){
				const contenteditable = this.attributes.find(
					(attribute: Attribute) => attribute.name === 'contenteditable'
				);

				if (!contenteditable) {
					component.error(binding, {
						code: `missing-contenteditable-attribute`,
						message: `'contenteditable' attribute is required for text and html two-way bindings`
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

	validate_content() {
		if (!a11y_required_content.has(this.name)) return;

		if (this.children.length === 0) {
			this.component.warn(this, {
				code: `a11y-missing-content`,
				message: `A11y: <${this.name}> element should have child content`
			});
		}
	}

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
							message: `The passive modifier only works with wheel and touch events`
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

	add_css_class(class_name = this.component.stylesheet.id) {
		const class_attribute = this.attributes.find(a => a.name === 'class');
		if (class_attribute && !class_attribute.is_true) {
			if (class_attribute.chunks.length === 1 && class_attribute.chunks[0].type === 'Text') {
				(class_attribute.chunks[0] as Text).data += ` ${class_name}`;
			} else {
				(<Node[]>class_attribute.chunks).push(
					new Text(this.component, this, this.scope, {
						type: 'Text',
						data: ` ${class_name}`
					})
				);
			}
		} else {
			this.attributes.push(
				new Attribute(this.component, this, this.scope, {
					type: 'Attribute',
					name: 'class',
					value: [{ type: 'Text', data: class_name }]
				})
			);
		}
	}
}

function should_have_attribute(
	node,
	attributes: string[],
	name = node.name
) {
	const article = /^[aeiou]/.test(attributes[0]) ? 'an' : 'a';
	const sequence = attributes.length > 1 ?
		attributes.slice(0, -1).join(', ') + ` or ${attributes[attributes.length - 1]}` :
		attributes[0];

	node.component.warn(node, {
		code: `a11y-missing-attribute`,
		message: `A11y: <${name}> element should have ${article} ${sequence} attribute`
	});
}
