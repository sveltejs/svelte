import isVoidElementName from '../../utils/isVoidElementName';
import { quotePropIfNecessary } from '../../utils/quoteIfNecessary';
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
import mapChildren from './shared/mapChildren';
import { dimensions } from '../../utils/patterns';
import fuzzymatch from '../../utils/fuzzymatch';
import Ref from './Ref';
import list from '../../utils/list';

const svg = /^(?:altGlyph|altGlyphDef|altGlyphItem|animate|animateColor|animateMotion|animateTransform|circle|clipPath|color-profile|cursor|defs|desc|discard|ellipse|feBlend|feColorMatrix|feComponentTransfer|feComposite|feConvolveMatrix|feDiffuseLighting|feDisplacementMap|feDistantLight|feDropShadow|feFlood|feFuncA|feFuncB|feFuncG|feFuncR|feGaussianBlur|feImage|feMerge|feMergeNode|feMorphology|feOffset|fePointLight|feSpecularLighting|feSpotLight|feTile|feTurbulence|filter|font|font-face|font-face-format|font-face-name|font-face-src|font-face-uri|foreignObject|g|glyph|glyphRef|hatch|hatchpath|hkern|image|line|linearGradient|marker|mask|mesh|meshgradient|meshpatch|meshrow|metadata|missing-glyph|mpath|path|pattern|polygon|polyline|radialGradient|rect|set|solidcolor|stop|switch|symbol|text|textPath|tref|tspan|unknown|use|view|vkern)$/;

const ariaAttributes = 'activedescendant atomic autocomplete busy checked controls current describedby details disabled dropeffect errormessage expanded flowto grabbed haspopup hidden invalid keyshortcuts label labelledby level live modal multiline multiselectable orientation owns placeholder posinset pressed readonly relevant required roledescription selected setsize sort valuemax valuemin valuenow valuetext'.split(' ');
const ariaAttributeSet = new Set(ariaAttributes);

const ariaRoles = 'alert alertdialog application article banner button cell checkbox columnheader combobox command complementary composite contentinfo definition dialog directory document feed figure form grid gridcell group heading img input landmark link list listbox listitem log main marquee math menu menubar menuitem menuitemcheckbox menuitemradio navigation none note option presentation progressbar radio radiogroup range region roletype row rowgroup rowheader scrollbar search searchbox section sectionhead select separator slider spinbutton status structure switch tab table tablist tabpanel term textbox timer toolbar tooltip tree treegrid treeitem widget window'.split(' ');
const ariaRoleSet = new Set(ariaRoles);

const a11yRequiredAttributes = {
	a: ['href'],
	area: ['alt', 'aria-label', 'aria-labelledby'],

	// html-has-lang
	html: ['lang'],

	// iframe-has-title
	iframe: ['title'],
	img: ['alt'],
	object: ['title', 'aria-label', 'aria-labelledby']
};

const a11yDistractingElements = new Set([
	'blink',
	'marquee'
]);

const a11yRequiredContent = new Set([
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

const invisibleElements = new Set(['meta', 'html', 'script', 'style']);

const validModifiers = new Set([
	'preventDefault',
	'stopPropagation',
	'capture',
	'once',
	'passive'
]);

const passiveEvents = new Set([
	'wheel',
	'touchstart',
	'touchmove',
	'touchend',
	'touchcancel'
]);

export default class Element extends Node {
	type: 'Element';
	name: string;
	scope: any; // TODO
	attributes: Attribute[] = [];
	actions: Action[] = [];
	bindings: Binding[] = [];
	classes: Class[] = [];
	handlers: EventHandler[] = [];
	intro?: Transition = null;
	outro?: Transition = null;
	animation?: Animation = null;
	children: Node[];

	ref: Ref;
	namespace: string;

	constructor(component, parent, scope, info: any) {
		super(component, parent, scope, info);
		this.name = info.name;
		this.scope = scope;

		const parentElement = parent.findNearest(/^Element/);
		this.namespace = this.name === 'svg' ?
			namespaces.svg :
			parentElement ? parentElement.namespace : this.component.namespace;

		if (!this.namespace && svg.test(this.name)) {
			this.component.warn(this, {
				code: `missing-namespace`,
				message: `<${this.name}> is an SVG element – did you forget to add { namespace: 'svg' } ?`
			});
		}

		if (this.name === 'textarea') {
			if (info.children.length > 0) {
				const valueAttribute = info.attributes.find(node => node.name === 'value');
				if (valueAttribute) {
					component.error(valueAttribute, {
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
			const valueAttribute = info.attributes.find((attribute: Node) => attribute.name === 'value');

			if (!valueAttribute) {
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

				case 'Transition':
					const transition = new Transition(component, this, scope, node);
					if (node.intro) this.intro = transition;
					if (node.outro) this.outro = transition;
					break;

				case 'Animation':
					this.animation = new Animation(component, this, scope, node);
					break;

				case 'Ref':
					this.ref = new Ref(component, this, scope, node);
					break;

				default:
					throw new Error(`Not implemented: ${node.type}`);
			}
		});

		this.children = mapChildren(component, this, scope, info.children);

		this.validate();

		component.stylesheet.apply(this);
	}

	validate() {
		if (a11yDistractingElements.has(this.name)) {
			// no-distracting-elements
			this.component.warn(this, {
				code: `a11y-distracting-elements`,
				message: `A11y: Avoid <${this.name}> elements`
			});
		}

		if (this.name === 'figcaption') {
			if (this.parent.name !== 'figure') {
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

			const index = children.findIndex(child => child.name === 'figcaption');

			if (index !== -1 && (index !== 0 && index !== children.length - 1)) {
				this.component.warn(children[index], {
					code: `a11y-structure`,
					message: `A11y: <figcaption> must be first or last child of <figure>`
				});
			}
		}

		this.validateAttributes();
		this.validateBindings();
		this.validateContent();
		this.validateEventHandlers();
	}

	validateAttributes() {
		const { component } = this;

		const attributeMap = new Map();

		this.attributes.forEach(attribute => {
			if (attribute.isSpread) return;

			const name = attribute.name.toLowerCase();

			// aria-props
			if (name.startsWith('aria-')) {
				if (invisibleElements.has(this.name)) {
					// aria-unsupported-elements
					component.warn(attribute, {
						code: `a11y-aria-attributes`,
						message: `A11y: <${this.name}> should not have aria-* attributes`
					});
				}

				const type = name.slice(5);
				if (!ariaAttributeSet.has(type)) {
					const match = fuzzymatch(type, ariaAttributes);
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
				if (invisibleElements.has(this.name)) {
					// aria-unsupported-elements
					component.warn(attribute, {
						code: `a11y-misplaced-role`,
						message: `A11y: <${this.name}> should not have role attribute`
					});
				}

				const value = attribute.getStaticValue();
				if (value && !ariaRoleSet.has(value)) {
					const match = fuzzymatch(value, ariaRoles);
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
				const value = attribute.getStaticValue();
				if (!isNaN(value) && +value > 0) {
					component.warn(attribute, {
						code: `a11y-positive-tabindex`,
						message: `A11y: avoid tabindex values above zero`
					});
				}
			}

			if (name === 'slot') {
				if (!attribute.isStatic) {
					component.error(attribute, {
						code: `invalid-slot-attribute`,
						message: `slot attribute cannot have a dynamic value`
					});
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

			attributeMap.set(attribute.name, attribute);
		});

		// handle special cases
		if (this.name === 'a') {
			const attribute = attributeMap.get('href') || attributeMap.get('xlink:href');

			if (attribute) {
				const value = attribute.getStaticValue();

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
			const requiredAttributes = a11yRequiredAttributes[this.name];
			if (requiredAttributes) {
				const hasAttribute = requiredAttributes.some(name => attributeMap.has(name));

				if (!hasAttribute) {
					shouldHaveAttribute(this, requiredAttributes);
				}
			}

			if (this.name === 'input') {
				const type = attributeMap.get('type');
				if (type && type.getStaticValue() === 'image') {
					shouldHaveAttribute(
						this,
						['alt', 'aria-label', 'aria-labelledby'],
						'input type="image"'
					);
				}
			}
		}
	}

	validateBindings() {
		const { component } = this;

		const checkTypeAttribute = () => {
			const attribute = this.attributes.find(
				(attribute: Attribute) => attribute.name === 'type'
			);

			if (!attribute) return null;

			if (!attribute.isStatic) {
				component.error(attribute, {
					code: `invalid-type`,
					message: `'type' attribute cannot be dynamic if input uses two-way binding`
				});
			}

			const value = attribute.getStaticValue();

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

					if (attribute && !attribute.isStatic) {
						component.error(attribute, {
							code: `dynamic-multiple-attribute`,
							message: `'multiple' attribute cannot be dynamic if select uses two-way binding`
						});
					}
				} else {
					checkTypeAttribute();
				}
			} else if (name === 'checked' || name === 'indeterminate') {
				if (this.name !== 'input') {
					component.error(binding, {
						code: `invalid-binding`,
						message: `'${name}' is not a valid binding on <${this.name}> elements`
					});
				}

				if (checkTypeAttribute() !== 'checkbox') {
					component.error(binding, {
						code: `invalid-binding`,
						message: `'${name}' binding can only be used with <input type="checkbox">`
					});
				}
			} else if (name === 'group') {
				if (this.name !== 'input') {
					component.error(binding, {
						code: `invalid-binding`,
						message: `'group' is not a valid binding on <${this.name}> elements`
					});
				}

				const type = checkTypeAttribute();

				if (type !== 'checkbox' && type !== 'radio') {
					component.error(binding, {
						code: `invalid-binding`,
						message: `'checked' binding can only be used with <input type="checkbox"> or <input type="radio">`
					});
				}
			} else if (name == 'files') {
				if (this.name !== 'input') {
					component.error(binding, {
						code: `invalid-binding`,
						message: `'files' binding acn only be used with <input type="file">`
					});
				}

				const type = checkTypeAttribute();

				if (type !== 'file') {
					component.error(binding, {
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
				} else if (isVoidElementName(this.name)) {
					component.error(binding, {
						code: 'invalid-binding',
						message: `'${binding.name}' is not a valid binding on void elements like <${this.name}>. Use a wrapper element instead`
					});
				}
			} else {
				component.error(binding, {
					code: `invalid-binding`,
					message: `'${binding.name}' is not a valid binding`
				});
			}
		});
	}

	validateContent() {
		if (!a11yRequiredContent.has(this.name)) return;

		if (this.children.length === 0) {
			this.component.warn(this, {
				code: `a11y-missing-content`,
				message: `A11y: <${this.name}> element should have child content`
			});
		}
	}

	validateEventHandlers() {
		const { component } = this;

		this.handlers.forEach(handler => {
			if (handler.modifiers.has('passive') && handler.modifiers.has('preventDefault')) {
				component.error(handler, {
					code: 'invalid-event-modifier',
					message: `The 'passive' and 'preventDefault' modifiers cannot be used together`
				});
			}

			handler.modifiers.forEach(modifier => {
				if (!validModifiers.has(modifier)) {
					component.error(handler, {
						code: 'invalid-event-modifier',
						message: `Valid event modifiers are ${list([...validModifiers])}`
					});
				}

				if (modifier === 'passive') {
					if (passiveEvents.has(handler.name)) {
						if (!handler.usesEventObject) {
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

				if (component.options.legacy && (modifier === 'once' || modifier === 'passive')) {
					// TODO this could be supported, but it would need a few changes to
					// how event listeners work
					component.error(handler, {
						code: 'invalid-event-modifier',
						message: `The '${modifier}' modifier cannot be used in legacy mode`
					});
				}
			});

			if (passiveEvents.has(handler.name) && !handler.usesEventObject && !handler.modifiers.has('preventDefault')) {
				// touch/wheel events should be passive by default
				handler.modifiers.add('passive');
			}
		});
	}

	getStaticAttributeValue(name: string) {
		const attribute = this.attributes.find(
			(attr: Attribute) => attr.type === 'Attribute' && attr.name.toLowerCase() === name
		);

		if (!attribute) return null;

		if (attribute.isTrue) return true;
		if (attribute.chunks.length === 0) return '';

		if (attribute.chunks.length === 1 && attribute.chunks[0].type === 'Text') {
			return attribute.chunks[0].data;
		}

		return null;
	}

	isMediaNode() {
		return this.name === 'audio' || this.name === 'video';
	}

	remount(name: string) {
		const slot = this.attributes.find(attribute => attribute.name === 'slot');
		if (slot) {
			const prop = quotePropIfNecessary(slot.chunks[0].data);
			return `@append(${name}.$$.slotted${prop}, ${this.var});`;
		}

		return `@append(${name}.$$.slotted.default, ${this.var});`;
	}

	addCssClass(className = this.component.stylesheet.id) {
		const classAttribute = this.attributes.find(a => a.name === 'class');
		if (classAttribute && !classAttribute.isTrue) {
			if (classAttribute.chunks.length === 1 && classAttribute.chunks[0].type === 'Text') {
				(<Text>classAttribute.chunks[0]).data += ` ${className}`;
			} else {
				(<Node[]>classAttribute.chunks).push(
					new Text(this.component, this, this.scope, {
						type: 'Text',
						data: ` ${className}`
					})
				);
			}
		} else {
			this.attributes.push(
				new Attribute(this.component, this, this.scope, {
					type: 'Attribute',
					name: 'class',
					value: [{ type: 'Text', data: className }]
				})
			);
		}
	}
}

function shouldHaveAttribute(
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