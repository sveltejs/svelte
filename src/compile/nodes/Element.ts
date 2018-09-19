import deindent from '../../utils/deindent';
import { stringify, escapeHTML } from '../../utils/stringify';
import flattenReference from '../../utils/flattenReference';
import isVoidElementName from '../../utils/isVoidElementName';
import validCalleeObjects from '../../utils/validCalleeObjects';
import reservedNames from '../../utils/reservedNames';
import fixAttributeCasing from '../../utils/fixAttributeCasing';
import { quoteNameIfNecessary, quotePropIfNecessary } from '../../utils/quoteIfNecessary';
import Component from '../Component';
import Node from './shared/Node';
import Block from '../dom/Block';
import Attribute from './Attribute';
import Binding from './Binding';
import EventHandler from './EventHandler';
import Transition from './Transition';
import Animation from './Animation';
import Action from './Action';
import Class from './Class';
import Text from './Text';
import * as namespaces from '../../utils/namespaces';
import mapChildren from './shared/mapChildren';
import { dimensions } from '../../utils/patterns';
import fuzzymatch from '../validate/utils/fuzzymatch';
import Ref from './Ref';

// source: https://gist.github.com/ArjanSchouten/0b8574a6ad7f5065a5e7
const booleanAttributes = new Set([
	'async',
	'autocomplete',
	'autofocus',
	'autoplay',
	'border',
	'challenge',
	'checked',
	'compact',
	'contenteditable',
	'controls',
	'default',
	'defer',
	'disabled',
	'formnovalidate',
	'frameborder',
	'hidden',
	'indeterminate',
	'ismap',
	'loop',
	'multiple',
	'muted',
	'nohref',
	'noresize',
	'noshade',
	'novalidate',
	'nowrap',
	'open',
	'readonly',
	'required',
	'reversed',
	'scoped',
	'scrolling',
	'seamless',
	'selected',
	'sortable',
	'spellcheck',
	'translate'
]);

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

export default class Element extends Node {
	type: 'Element';
	name: string;
	scope: any; // TODO
	attributes: Attribute[];
	actions: Action[];
	bindings: Binding[];
	classes: Class[];
	classDependencies: string[];
	handlers: EventHandler[];
	intro?: Transition;
	outro?: Transition;
	animation?: Animation;
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

		this.attributes = [];
		this.actions = [];
		this.bindings = [];
		this.classes = [];
		this.classDependencies = [];
		this.handlers = [];

		this.intro = null;
		this.outro = null;
		this.animation = null;

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
				if (attribute.isDynamic) {
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

			if (attribute.isDynamic) {
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

					if (attribute && attribute.isDynamic) {
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

	init(
		block: Block,
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		if (this.name === 'slot' || this.name === 'option' || this.component.options.dev) {
			this.cannotUseInnerHTML();
		}

		this.var = block.getUniqueName(
			this.name.replace(/[^a-zA-Z0-9_$]/g, '_')
		);

		this.attributes.forEach(attr => {
			if (
				attr.chunks &&
				attr.chunks.length &&
				(attr.chunks.length > 1 || attr.chunks[0].type !== 'Text')
			) {
				this.parent.cannotUseInnerHTML();
			}
			if (attr.dependencies.size) {
				block.addDependencies(attr.dependencies);

				// special case — <option value={foo}> — see below
				if (this.name === 'option' && attr.name === 'value') {
					let select = this.parent;
					while (select && (select.type !== 'Element' || select.name !== 'select')) select = select.parent;

					if (select && select.selectBindingDependencies) {
						select.selectBindingDependencies.forEach(prop => {
							attr.dependencies.forEach((dependency: string) => {
								this.component.indirectDependencies.get(prop).add(dependency);
							});
						});
					}
				}
			}
		});

		this.actions.forEach(action => {
			this.parent.cannotUseInnerHTML();
			if (action.expression) {
				block.addDependencies(action.expression.dependencies);
			}
		});

		this.bindings.forEach(binding => {
			this.parent.cannotUseInnerHTML();
			block.addDependencies(binding.value.dependencies);
		});

		this.classes.forEach(classDir => {
			this.parent.cannotUseInnerHTML();
			if (classDir.expression) {
				block.addDependencies(classDir.expression.dependencies);
			}
		});

		this.handlers.forEach(handler => {
			this.parent.cannotUseInnerHTML();
			block.addDependencies(handler.dependencies);
		});

		if (this.intro || this.outro || this.animation || this.ref) {
			this.parent.cannotUseInnerHTML();
		}

		if (this.intro) block.addIntro();
		if (this.outro) block.addOutro();
		if (this.animation) block.addAnimation();

		const valueAttribute = this.attributes.find((attribute: Attribute) => attribute.name === 'value');

		// special case — in a case like this...
		//
		//   <select bind:value='foo'>
		//     <option value='{bar}'>bar</option>
		//     <option value='{baz}'>baz</option>
		//   </option>
		//
		// ...we need to know that `foo` depends on `bar` and `baz`,
		// so that if `foo.qux` changes, we know that we need to
		// mark `bar` and `baz` as dirty too
		if (this.name === 'select') {
			const binding = this.bindings.find(node => node.name === 'value');
			if (binding) {
				// TODO does this also apply to e.g. `<input type='checkbox' bind:group='foo'>`?
				const dependencies = binding.value.dependencies;
				this.selectBindingDependencies = dependencies;
				dependencies.forEach((prop: string) => {
					this.component.indirectDependencies.set(prop, new Set());
				});
			} else {
				this.selectBindingDependencies = null;
			}
		}

		const slot = this.getStaticAttributeValue('slot');
		if (slot && this.hasAncestor('InlineComponent')) {
			this.cannotUseInnerHTML();
			this.slotted = true;
			// TODO validate slots — no nesting, no dynamic names...
			const component = this.findNearest(/^InlineComponent/);
			component._slots.add(slot);
		}

		if (this.children.length) {
			if (this.name === 'pre' || this.name === 'textarea') stripWhitespace = false;
			this.initChildren(block, stripWhitespace, nextSibling);
		}
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { component } = this;

		if (this.name === 'slot') {
			const slotName = this.getStaticAttributeValue('name') || 'default';
			this.component.slots.add(slotName);
		}

		if (this.name === 'noscript') return;

		const node = this.var;
		const nodes = parentNodes && block.getUniqueName(`${this.var}_nodes`) // if we're in unclaimable territory, i.e. <head>, parentNodes is null

		const slot = this.attributes.find((attribute: Node) => attribute.name === 'slot');
		const prop = slot && quotePropIfNecessary(slot.chunks[0].data);
		const initialMountNode = this.slotted ?
			`${this.findNearest(/^InlineComponent/).var}._slotted${prop}` : // TODO this looks bonkers
			parentNode;

		block.addVariable(node);
		const renderStatement = getRenderStatement(this.namespace, this.name);
		block.builders.create.addLine(
			`${node} = ${renderStatement};`
		);

		if (this.component.options.hydratable) {
			if (parentNodes) {
				block.builders.claim.addBlock(deindent`
					${node} = ${getClaimStatement(component, this.namespace, parentNodes, this)};
					var ${nodes} = @children(${this.name === 'template' ? `${node}.content` : node});
				`);
			} else {
				block.builders.claim.addLine(
					`${node} = ${renderStatement};`
				);
			}
		}

		if (initialMountNode) {
			block.builders.mount.addLine(
				`@append(${initialMountNode}, ${node});`
			);

			if (initialMountNode === 'document.head') {
				block.builders.destroy.addLine(`@detachNode(${node});`);
			}
		} else {
			block.builders.mount.addLine(`@insert(#target, ${node}, anchor);`);

			// TODO we eventually need to consider what happens to elements
			// that belong to the same outgroup as an outroing element...
			block.builders.destroy.addConditional('detach', `@detachNode(${node});`);
		}

		// insert static children with textContent or innerHTML
		if (!this.namespace && this.canUseInnerHTML && this.children.length > 0) {
			if (this.children.length === 1 && this.children[0].type === 'Text') {
				block.builders.create.addLine(
					`${node}.textContent = ${stringify(this.children[0].data)};`
				);
			} else {
				block.builders.create.addLine(
					`${node}.innerHTML = ${stringify(this.children.map(toHTML).join(''))};`
				);
			}
		} else {
			this.children.forEach((child: Node) => {
				child.build(block, this.name === 'template' ? `${node}.content` : node, nodes);
			});
		}

		let hasHoistedEventHandlerOrBinding = (
			//(this.hasAncestor('EachBlock') && this.bindings.length > 0) ||
			this.handlers.some(handler => handler.shouldHoist)
		);
		const eventHandlerOrBindingUsesComponent = (
			this.bindings.length > 0 ||
			this.handlers.some(handler => handler.usesComponent)
		);

		const eventHandlerOrBindingUsesContext = (
			this.bindings.some(binding => binding.usesContext) ||
			this.handlers.some(handler => handler.usesContext)
		);

		if (hasHoistedEventHandlerOrBinding) {
			const initialProps: string[] = [];
			const updates: string[] = [];

			if (eventHandlerOrBindingUsesComponent) {
				const component = block.alias('component');
				initialProps.push(component === 'component' ? 'component' : `component: ${component}`);
			}

			if (eventHandlerOrBindingUsesContext) {
				initialProps.push(`ctx`);
				block.builders.update.addLine(`${node}._svelte.ctx = ctx;`);
				block.maintainContext = true;
			}

			if (initialProps.length) {
				block.builders.hydrate.addBlock(deindent`
					${node}._svelte = { ${initialProps.join(', ')} };
				`);
			}
		} else {
			if (eventHandlerOrBindingUsesContext) {
				block.maintainContext = true;
			}
		}

		this.addBindings(block);
		this.addEventHandlers(block);
		if (this.ref) this.addRef(block);
		this.addAttributes(block);
		this.addTransitions(block);
		this.addAnimation(block);
		this.addActions(block);
		this.addClasses(block);

		if (this.initialUpdate) {
			block.builders.mount.addBlock(this.initialUpdate);
		}

		if (nodes) {
			block.builders.claim.addLine(
				`${nodes}.forEach(@detachNode);`
			);
		}

		function toHTML(node: Element | Text) {
			if (node.type === 'Text') {
				return node.parent &&
					node.parent.type === 'Element' &&
					(node.parent.name === 'script' || node.parent.name === 'style')
					? node.data
					: escapeHTML(node.data);
			}

			if (node.name === 'noscript') return '';

			let open = `<${node.name}`;

			node.attributes.forEach((attr: Node) => {
				open += ` ${fixAttributeCasing(attr.name)}${stringifyAttributeValue(attr.chunks)}`
			});

			if (isVoidElementName(node.name)) return open + '>';

			return `${open}>${node.children.map(toHTML).join('')}</${node.name}>`;
		}

		if (this.component.options.dev) {
			const loc = this.component.locate(this.start);
			block.builders.hydrate.addLine(
				`@addLoc(${this.var}, ${this.component.fileVar}, ${loc.line}, ${loc.column}, ${this.start});`
			);
		}
	}

	addBindings(
		block: Block
	) {
		if (this.bindings.length === 0) return;

		if (this.name === 'select' || this.isMediaNode()) this.component.target.hasComplexBindings = true;

		const needsLock = this.name !== 'input' || !/radio|checkbox|range|color/.test(this.getStaticAttributeValue('type'));

		// TODO munge in constructor
		const mungedBindings = this.bindings.map(binding => binding.munge(block));

		const lock = mungedBindings.some(binding => binding.needsLock) ?
			block.getUniqueName(`${this.var}_updating`) :
			null;

		if (lock) block.addVariable(lock, 'false');

		const groups = events
			.map(event => {
				return {
					events: event.eventNames,
					bindings: mungedBindings.filter(binding => event.filter(this, binding.name))
				};
			})
			.filter(group => group.bindings.length);

		groups.forEach(group => {
			const handler = block.getUniqueName(`${this.var}_${group.events.join('_')}_handler`);

			const needsLock = group.bindings.some(binding => binding.needsLock);

			group.bindings.forEach(binding => {
				if (!binding.updateDom) return;

				const updateConditions = needsLock ? [`!${lock}`] : [];
				if (binding.updateCondition) updateConditions.push(binding.updateCondition);

				block.builders.update.addLine(
					updateConditions.length ? `if (${updateConditions.join(' && ')}) ${binding.updateDom}` : binding.updateDom
				);
			});

			const usesContext = group.bindings.some(binding => binding.handler.usesContext);
			const usesState = group.bindings.some(binding => binding.handler.usesState);
			const usesStore = group.bindings.some(binding => binding.handler.usesStore);
			const mutations = group.bindings.map(binding => binding.handler.mutation).filter(Boolean).join('\n');

			const props = new Set();
			const storeProps = new Set();
			group.bindings.forEach(binding => {
				binding.handler.props.forEach(prop => {
					props.add(prop);
				});

				binding.handler.storeProps.forEach(prop => {
					storeProps.add(prop);
				});
			}); // TODO use stringifyProps here, once indenting is fixed

			// media bindings — awkward special case. The native timeupdate events
			// fire too infrequently, so we need to take matters into our
			// own hands
			let animation_frame;
			if (group.events[0] === 'timeupdate') {
				animation_frame = block.getUniqueName(`${this.var}_animationframe`);
				block.addVariable(animation_frame);
			}

			block.builders.init.addBlock(deindent`
				function ${handler}() {
					${
						animation_frame && deindent`
							cancelAnimationFrame(${animation_frame});
							if (!${this.var}.paused) ${animation_frame} = requestAnimationFrame(${handler});`
					}
					${usesStore && `var $ = #component.store.get();`}
					${needsLock && `${lock} = true;`}
					${mutations.length > 0 && mutations}
					${props.size > 0 && `#component.set({ ${Array.from(props).join(', ')} });`}
					${storeProps.size > 0 && `#component.store.set({ ${Array.from(storeProps).join(', ')} });`}
					${needsLock && `${lock} = false;`}
				}
			`);

			group.events.forEach(name => {
				if (name === 'resize') {
					// special case
					const resize_listener = block.getUniqueName(`${this.var}_resize_listener`);
					block.addVariable(resize_listener);

					block.builders.mount.addLine(
						`${resize_listener} = @addResizeListener(${this.var}, ${handler});`
					);

					block.builders.destroy.addLine(
						`${resize_listener}.cancel();`
					);
				} else {
					block.builders.hydrate.addLine(
						`@addListener(${this.var}, "${name}", ${handler});`
					);

					block.builders.destroy.addLine(
						`@removeListener(${this.var}, "${name}", ${handler});`
					);
				}
			});

			const allInitialStateIsDefined = group.bindings
				.map(binding => `'${binding.object}' in ctx`)
				.join(' && ');

			if (this.name === 'select' || group.bindings.find(binding => binding.name === 'indeterminate' || binding.isReadOnlyMediaAttribute)) {
				this.component.target.hasComplexBindings = true;

				block.builders.hydrate.addLine(
					`if (!(${allInitialStateIsDefined})) #component.root._beforecreate.push(${handler});`
				);
			}

			if (group.events[0] === 'resize') {
				this.component.target.hasComplexBindings = true;

				block.builders.hydrate.addLine(
					`#component.root._beforecreate.push(${handler});`
				);
			}
		});

		this.initialUpdate = mungedBindings.map(binding => binding.initialUpdate).filter(Boolean).join('\n');
	}

	addAttributes(block: Block) {
		if (this.attributes.find(attr => attr.type === 'Spread')) {
			this.addSpreadAttributes(block);
			return;
		}

		this.attributes.forEach((attribute: Attribute) => {
			if (attribute.name === 'class' && attribute.isDynamic) {
				this.classDependencies.push(...attribute.dependencies);
			}
			attribute.render(block);
		});
	}

	addSpreadAttributes(block: Block) {
		const levels = block.getUniqueName(`${this.var}_levels`);
		const data = block.getUniqueName(`${this.var}_data`);

		const initialProps = [];
		const updates = [];

		this.attributes
			.filter(attr => attr.type === 'Attribute' || attr.type === 'Spread')
			.forEach(attr => {
				const condition = attr.dependencies.size > 0
					? `(${[...attr.dependencies].map(d => `changed.${d}`).join(' || ')})`
					: null;

				if (attr.isSpread) {
					const { snippet, dependencies } = attr.expression;

					initialProps.push(snippet);

					updates.push(condition ? `${condition} && ${snippet}` : snippet);
				} else {
					const snippet = `{ ${quoteNameIfNecessary(attr.name)}: ${attr.getValue()} }`;
					initialProps.push(snippet);

					updates.push(condition ? `${condition} && ${snippet}` : snippet);
				}
			});

		block.builders.init.addBlock(deindent`
			var ${levels} = [
				${initialProps.join(',\n')}
			];

			var ${data} = {};
			for (var #i = 0; #i < ${levels}.length; #i += 1) {
				${data} = @assign(${data}, ${levels}[#i]);
			}
		`);

		block.builders.hydrate.addLine(
			`@setAttributes(${this.var}, ${data});`
		);

		block.builders.update.addBlock(deindent`
			@setAttributes(${this.var}, @getSpreadUpdate(${levels}, [
				${updates.join(',\n')}
			]));
		`);
	}

	addEventHandlers(block: Block) {
		const { component } = this;

		this.handlers.forEach(handler => {
			const isCustomEvent = component.events.has(handler.name);

			if (handler.callee) {
				handler.render(this.component, block, handler.shouldHoist);
			}

			const target = handler.shouldHoist ? 'this' : this.var;

			// get a name for the event handler that is globally unique
			// if hoisted, locally unique otherwise
			const handlerName = (handler.shouldHoist ? component : block).getUniqueName(
				`${handler.name.replace(/[^a-zA-Z0-9_$]/g, '_')}_handler`
			);

			const component_name = block.alias('component'); // can't use #component, might be hoisted

			// create the handler body
			const handlerBody = deindent`
				${handler.shouldHoist && (
					handler.usesComponent || handler.usesContext
						? `const { ${[handler.usesComponent && 'component', handler.usesContext && 'ctx'].filter(Boolean).join(', ')} } = ${target}._svelte;`
						: null
				)}

				${handler.snippet ?
					handler.snippet :
					`${component_name}.fire("${handler.name}", event);`}
			`;

			if (isCustomEvent) {
				block.addVariable(handlerName);

				block.builders.hydrate.addBlock(deindent`
					${handlerName} = %events-${handler.name}.call(${component_name}, ${this.var}, function(event) {
						${handlerBody}
					});
				`);

				block.builders.destroy.addLine(deindent`
					${handlerName}.destroy();
				`);
			} else {
				const handlerFunction = deindent`
					function ${handlerName}(event) {
						${handlerBody}
					}
				`;

				if (handler.shouldHoist) {
					component.target.blocks.push(handlerFunction);
				} else {
					block.builders.init.addBlock(handlerFunction);
				}

				block.builders.hydrate.addLine(
					`@addListener(${this.var}, "${handler.name}", ${handlerName});`
				);

				block.builders.destroy.addLine(
					`@removeListener(${this.var}, "${handler.name}", ${handlerName});`
				);
			}
		});
	}

	addRef(block: Block) {
		const ref = `#component.refs.${this.ref.name}`;

		block.builders.mount.addLine(
			`${ref} = ${this.var};`
		);

		block.builders.destroy.addLine(
			`if (${ref} === ${this.var}) ${ref} = null;`
		);
	}

	addTransitions(
		block: Block
	) {
		const { intro, outro } = this;

		if (!intro && !outro) return;

		if (intro === outro) {
			const name = block.getUniqueName(`${this.var}_transition`);
			const snippet = intro.expression
				? intro.expression.snippet
				: '{}';

			block.addVariable(name);

			const fn = `%transitions-${intro.name}`;

			block.builders.intro.addConditional(`#component.root._intro`, deindent`
				if (${name}) ${name}.invalidate();

				#component.root._aftercreate.push(() => {
					if (!${name}) ${name} = @wrapTransition(#component, ${this.var}, ${fn}, ${snippet}, true);
					${name}.run(1);
				});
			`);

			block.builders.outro.addBlock(deindent`
				if (!${name}) ${name} = @wrapTransition(#component, ${this.var}, ${fn}, ${snippet}, false);
				${name}.run(0, () => {
					#outrocallback();
					${name} = null;
				});
			`);

			block.builders.destroy.addConditional('detach', `if (${name}) ${name}.abort();`);
		} else {
			const introName = intro && block.getUniqueName(`${this.var}_intro`);
			const outroName = outro && block.getUniqueName(`${this.var}_outro`);

			if (intro) {
				block.addVariable(introName);
				const snippet = intro.expression
					? intro.expression.snippet
					: '{}';

				const fn = `%transitions-${intro.name}`; // TODO add built-in transitions?

				if (outro) {
					block.builders.intro.addBlock(deindent`
						if (${introName}) ${introName}.abort(1);
						if (${outroName}) ${outroName}.abort(1);
					`);
				}

				block.builders.intro.addConditional(`#component.root._intro`, deindent`
					#component.root._aftercreate.push(() => {
						${introName} = @wrapTransition(#component, ${this.var}, ${fn}, ${snippet}, true);
						${introName}.run(1);
					});
				`);
			}

			if (outro) {
				block.addVariable(outroName);
				const snippet = outro.expression
					? outro.expression.snippet
					: '{}';

				const fn = `%transitions-${outro.name}`;

				block.builders.intro.addBlock(deindent`
					if (${outroName}) ${outroName}.abort(1);
				`);

				// TODO hide elements that have outro'd (unless they belong to a still-outroing
				// group) prior to their removal from the DOM
				block.builders.outro.addBlock(deindent`
					${outroName} = @wrapTransition(#component, ${this.var}, ${fn}, ${snippet}, false);
					${outroName}.run(0, #outrocallback);
				`);

				block.builders.destroy.addConditional('detach', `if (${outroName}) ${outroName}.abort();`);
			}
		}
	}

	addAnimation(block: Block) {
		if (!this.animation) return;

		const rect = block.getUniqueName('rect');
		const animation = block.getUniqueName('animation');

		block.addVariable(rect);
		block.addVariable(animation);

		block.builders.measure.addBlock(deindent`
			${rect} = ${this.var}.getBoundingClientRect();
		`);

		block.builders.fix.addBlock(deindent`
			@fixPosition(${this.var});
			if (${animation}) ${animation}.stop();
		`);

		const params = this.animation.expression ? this.animation.expression.snippet : '{}';
		block.builders.animate.addBlock(deindent`
			if (${animation}) ${animation}.stop();
			${animation} = @wrapAnimation(${this.var}, ${rect}, %animations-${this.animation.name}, ${params});
		`);
	}

	addActions(block: Block) {
		this.actions.forEach(action => {
			const { expression } = action;
			let snippet, dependencies;
			if (expression) {
				snippet = expression.snippet;
				dependencies = expression.dependencies;
			}

			const name = block.getUniqueName(
				`${action.name.replace(/[^a-zA-Z0-9_$]/g, '_')}_action`
			);

			block.addVariable(name);
			const fn = `%actions-${action.name}`;

			block.builders.mount.addLine(
				`${name} = ${fn}.call(#component, ${this.var}${snippet ? `, ${snippet}` : ''}) || {};`
			);

			if (dependencies && dependencies.size > 0) {
				let conditional = `typeof ${name}.update === 'function' && `;
				const deps = [...dependencies].map(dependency => `changed.${dependency}`).join(' || ');
				conditional += dependencies.size > 1 ? `(${deps})` : deps;

				block.builders.update.addConditional(
					conditional,
					`${name}.update.call(#component, ${snippet});`
				);
			}

			block.builders.destroy.addLine(
				`if (typeof ${name}.destroy === 'function') ${name}.destroy.call(#component);`
			);
		});
	}

	addClasses(block: Block) {
		this.classes.forEach(classDir => {
			const { expression, name } = classDir;
			let snippet, dependencies;
			if (expression) {
				snippet = expression.snippet;
				dependencies = expression.dependencies;
			} else {
				snippet = `ctx${quotePropIfNecessary(name)}`;
				dependencies = new Set([name]);
			}
			const updater = `@toggleClass(${this.var}, "${name}", ${snippet});`;

			block.builders.hydrate.addLine(updater);

			if ((dependencies && dependencies.size > 0) || this.classDependencies.length) {
				const allDeps = this.classDependencies.concat(...dependencies);
				const deps = allDeps.map(dependency => `changed${quotePropIfNecessary(dependency)}`).join(' || ');
				const condition = allDeps.length > 1 ? `(${deps})` : deps;

				block.builders.update.addConditional(
					condition,
					updater
				);
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
			return `@append(${name}._slotted${prop}, ${this.var});`;
		}

		return `@append(${name}._slotted.default, ${this.var});`;
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

	ssr() {
		const { component } = this;

		let openingTag = `<${this.name}`;
		let textareaContents; // awkward special case

		const slot = this.getStaticAttributeValue('slot');
		if (slot && this.hasAncestor('InlineComponent')) {
			const slot = this.attributes.find((attribute: Node) => attribute.name === 'slot');
			const slotName = slot.chunks[0].data;
			const appendTarget = component.target.appendTargets[component.target.appendTargets.length - 1];
			appendTarget.slotStack.push(slotName);
			appendTarget.slots[slotName] = '';
		}

		const classExpr = this.classes.map((classDir: Class) => {
			const { expression, name } = classDir;
			const snippet = expression ? expression.snippet : `ctx${quotePropIfNecessary(name)}`;
			return `${snippet} ? "${name}" : ""`;
		}).join(', ');

		let addClassAttribute = classExpr ? true : false;

		if (this.attributes.find(attr => attr.isSpread)) {
			// TODO dry this out
			const args = [];
			this.attributes.forEach(attribute => {
				if (attribute.isSpread) {
					args.push(attribute.expression.snippet);
				} else {
					if (attribute.name === 'value' && this.name === 'textarea') {
						textareaContents = attribute.stringifyForSsr();
					} else if (attribute.isTrue) {
						args.push(`{ ${quoteNameIfNecessary(attribute.name)}: true }`);
					} else if (
						booleanAttributes.has(attribute.name) &&
						attribute.chunks.length === 1 &&
						attribute.chunks[0].type !== 'Text'
					) {
						// a boolean attribute with one non-Text chunk
						args.push(`{ ${quoteNameIfNecessary(attribute.name)}: ${attribute.chunks[0].snippet} }`);
					} else {
						args.push(`{ ${quoteNameIfNecessary(attribute.name)}: \`${attribute.stringifyForSsr()}\` }`);
					}
				}
			});

			openingTag += "${@spread([" + args.join(', ') + "])}";
		} else {
			this.attributes.forEach((attribute: Node) => {
				if (attribute.type !== 'Attribute') return;

				if (attribute.name === 'value' && this.name === 'textarea') {
					textareaContents = attribute.stringifyForSsr();
				} else if (attribute.isTrue) {
					openingTag += ` ${attribute.name}`;
				} else if (
					booleanAttributes.has(attribute.name) &&
					attribute.chunks.length === 1 &&
					attribute.chunks[0].type !== 'Text'
				) {
					// a boolean attribute with one non-Text chunk
					openingTag += '${' + attribute.chunks[0].snippet + ' ? " ' + attribute.name + '" : "" }';
				} else if (attribute.name === 'class' && classExpr) {
					addClassAttribute = false;
					openingTag += ` class="\${ [\`${attribute.stringifyForSsr()}\`, ${classExpr} ].join(' ').trim() }"`;
				} else {
					openingTag += ` ${attribute.name}="${attribute.stringifyForSsr()}"`;
				}
			});
		}

		if (addClassAttribute) {
			openingTag += ` class="\${ [${classExpr}].join(' ').trim() }"`;
		}

		openingTag += '>';

		component.target.append(openingTag);

		if (this.name === 'textarea' && textareaContents !== undefined) {
			component.target.append(textareaContents);
		} else {
			this.children.forEach((child: Node) => {
				child.ssr();
			});
		}

		if (!isVoidElementName(this.name)) {
			component.target.append(`</${this.name}>`);
		}
	}
}

function getRenderStatement(
	namespace: string,
	name: string
) {
	if (namespace === 'http://www.w3.org/2000/svg') {
		return `@createSvgElement("${name}")`;
	}

	if (namespace) {
		return `document.createElementNS("${namespace}", "${name}")`;
	}

	return `@createElement("${name}")`;
}

function getClaimStatement(
	component: Component,
	namespace: string,
	nodes: string,
	node: Node
) {
	const attributes = node.attributes
		.filter((attr: Node) => attr.type === 'Attribute')
		.map((attr: Node) => `${quoteNameIfNecessary(attr.name)}: true`)
		.join(', ');

	const name = namespace ? node.name : node.name.toUpperCase();

	return `@claimElement(${nodes}, "${name}", ${attributes
		? `{ ${attributes} }`
		: `{}`}, ${namespace === namespaces.svg ? true : false})`;
}

function stringifyAttributeValue(value: Node[] | true) {
	if (value === true) return '';
	if (value.length === 0) return `=""`;

	const data = value[0].data;
	return `=${JSON.stringify(data)}`;
}

const events = [
	{
		eventNames: ['input'],
		filter: (node: Element, name: string) =>
			node.name === 'textarea' ||
			node.name === 'input' && !/radio|checkbox|range/.test(node.getStaticAttributeValue('type'))
	},
	{
		eventNames: ['change'],
		filter: (node: Element, name: string) =>
			node.name === 'select' ||
			node.name === 'input' && /radio|checkbox/.test(node.getStaticAttributeValue('type'))
	},
	{
		eventNames: ['change', 'input'],
		filter: (node: Element, name: string) =>
			node.name === 'input' && node.getStaticAttributeValue('type') === 'range'
	},

	{
		eventNames: ['resize'],
		filter: (node: Element, name: string) =>
			dimensions.test(name)
	},

	// media events
	{
		eventNames: ['timeupdate'],
		filter: (node: Element, name: string) =>
			node.isMediaNode() &&
			(name === 'currentTime' || name === 'played')
	},
	{
		eventNames: ['durationchange'],
		filter: (node: Element, name: string) =>
			node.isMediaNode() &&
			name === 'duration'
	},
	{
		eventNames: ['play', 'pause'],
		filter: (node: Element, name: string) =>
			node.isMediaNode() &&
			name === 'paused'
	},
	{
		eventNames: ['progress'],
		filter: (node: Element, name: string) =>
			node.isMediaNode() &&
			name === 'buffered'
	},
	{
		eventNames: ['loadedmetadata'],
		filter: (node: Element, name: string) =>
			node.isMediaNode() &&
			(name === 'buffered' || name === 'seekable')
	},
	{
		eventNames: ['volumechange'],
		filter: (node: Element, name: string) =>
			node.isMediaNode() &&
			name === 'volume'
	}
];

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