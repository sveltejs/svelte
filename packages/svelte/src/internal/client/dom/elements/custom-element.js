import { createClassComponent } from '../../../../legacy/legacy-client.js';
import { effect_root, render_effect } from '../../reactivity/effects.js';
import { append } from '../template.js';
import { define_property, get_descriptor, object_keys } from '../../../shared/utils.js';
import { create_element } from '../operations.js';

/**
 * @typedef {Object} CustomElementPropDefinition
 * @property {string} [attribute]
 * @property {boolean} [reflect]
 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
 */

/** @type {any} */
let SvelteElement;

if (typeof HTMLElement === 'function') {
	SvelteElement = class extends HTMLElement {
		/** The Svelte component constructor */
		$$ctor;
		/** Slots */
		$$s;
		/** @type {any} The Svelte component instance */
		$$c;
		/** Whether or not the custom element is connected */
		$$cn = false;
		/** @type {Record<string, any>} Component props data */
		$$d = {};
		/** `true` if currently in the process of reflecting component props back to attributes */
		$$r = false;
		/** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
		$$p_d = {};
		/** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
		$$l = {};
		/** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
		$$l_u = new Map();
		/** @type {any} The managed render effect for reflecting attributes */
		$$me;
		/** @type {ShadowRoot | null} The ShadowRoot of the custom element */
		$$shadowRoot = null;

		/**
		 * @param {*} $$componentCtor
		 * @param {*} $$slots
		 * @param {ShadowRootInit | undefined} shadow_root_init
		 */
		constructor($$componentCtor, $$slots, shadow_root_init) {
			super();
			this.$$ctor = $$componentCtor;
			this.$$s = $$slots;

			if (shadow_root_init) {
				// We need to store the reference to shadow root, because `closed` shadow root cannot be
				// accessed with `this.shadowRoot`.
				this.$$shadowRoot = this.attachShadow(shadow_root_init);
			}
		}

		/**
		 * @param {string} type
		 * @param {EventListenerOrEventListenerObject} listener
		 * @param {boolean | AddEventListenerOptions} [options]
		 */
		addEventListener(type, listener, options) {
			// We can't determine upfront if the event is a custom event or not, so we have to
			// listen to both. If someone uses a custom event with the same name as a regular
			// browser event, this fires twice - we can't avoid that.
			this.$$l[type] = this.$$l[type] || [];
			this.$$l[type].push(listener);
			if (this.$$c) {
				const unsub = this.$$c.$on(type, listener);
				this.$$l_u.set(listener, unsub);
			}
			super.addEventListener(type, listener, options);
		}

		/**
		 * @param {string} type
		 * @param {EventListenerOrEventListenerObject} listener
		 * @param {boolean | AddEventListenerOptions} [options]
		 */
		removeEventListener(type, listener, options) {
			super.removeEventListener(type, listener, options);
			if (this.$$c) {
				const unsub = this.$$l_u.get(listener);
				if (unsub) {
					unsub();
					this.$$l_u.delete(listener);
				}
			}
		}

		async connectedCallback() {
			this.$$cn = true;
			if (!this.$$c) {
				// We wait one tick to let possible child slot elements be created/mounted
				await Promise.resolve();
				if (!this.$$cn || this.$$c) {
					return;
				}
				/** @param {string} name */
				function create_slot(name) {
					/**
					 * @param {Element} anchor
					 */
					return (anchor) => {
						const slot = create_element('slot');
						if (name !== 'default') slot.name = name;

						append(anchor, slot);
					};
				}
				/** @type {Record<string, any>} */
				const $$slots = {};
				const existing_slots = get_custom_elements_slots(this);
				for (const name of this.$$s) {
					if (name in existing_slots) {
						if (name === 'default' && !this.$$d.children) {
							this.$$d.children = create_slot(name);
							$$slots.default = true;
						} else {
							$$slots[name] = create_slot(name);
						}
					}
				}
				for (const attribute of this.attributes) {
					// this.$$data takes precedence over this.attributes
					const name = this.$$g_p(attribute.name);
					if (!(name in this.$$d)) {
						this.$$d[name] = get_custom_element_value(name, attribute.value, this.$$p_d, 'toProp');
					}
				}
				// Port over props that were set programmatically before ce was initialized
				for (const key in this.$$p_d) {
					// @ts-expect-error
					if (!(key in this.$$d) && this[key] !== undefined) {
						// @ts-expect-error
						this.$$d[key] = this[key]; // don't transform, these were set through JavaScript
						// @ts-expect-error
						delete this[key]; // remove the property that shadows the getter/setter
					}
				}
				this.$$c = createClassComponent({
					component: this.$$ctor,
					target: this.$$shadowRoot || this,
					props: {
						...this.$$d,
						$$slots,
						$$host: this
					}
				});

				// Reflect component props as attributes
				this.$$me = effect_root(() => {
					render_effect(() => {
						this.$$r = true;
						for (const key of object_keys(this.$$c)) {
							if (!this.$$p_d[key]?.reflect) continue;
							this.$$d[key] = this.$$c[key];
							const attribute_value = get_custom_element_value(
								key,
								this.$$d[key],
								this.$$p_d,
								'toAttribute'
							);
							if (attribute_value == null) {
								this.removeAttribute(this.$$p_d[key].attribute || key);
							} else {
								this.setAttribute(this.$$p_d[key].attribute || key, attribute_value);
							}
						}
						this.$$r = false;
					});
				});

				for (const type in this.$$l) {
					for (const listener of this.$$l[type]) {
						const unsub = this.$$c.$on(type, listener);
						this.$$l_u.set(listener, unsub);
					}
				}
				this.$$l = {};
			}
		}

		// We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
		// and setting attributes through setAttribute etc, this is helpful

		/**
		 * @param {string} attr
		 * @param {string} _oldValue
		 * @param {string} newValue
		 */
		attributeChangedCallback(attr, _oldValue, newValue) {
			if (this.$$r) return;
			attr = this.$$g_p(attr);
			this.$$d[attr] = get_custom_element_value(attr, newValue, this.$$p_d, 'toProp');
			this.$$c?.$set({ [attr]: this.$$d[attr] });
		}

		disconnectedCallback() {
			this.$$cn = false;
			// In a microtask, because this could be a move within the DOM
			Promise.resolve().then(() => {
				if (!this.$$cn && this.$$c) {
					this.$$c.$destroy();
					this.$$me();
					this.$$c = undefined;
				}
			});
		}

		/**
		 * @param {string} attribute_name
		 */
		$$g_p(attribute_name) {
			return (
				object_keys(this.$$p_d).find(
					(key) =>
						this.$$p_d[key].attribute === attribute_name ||
						(!this.$$p_d[key].attribute && key.toLowerCase() === attribute_name)
				) || attribute_name
			);
		}
	};
}

/**
 * @param {string} prop
 * @param {any} value
 * @param {Record<string, CustomElementPropDefinition>} props_definition
 * @param {'toAttribute' | 'toProp'} [transform]
 */
function get_custom_element_value(prop, value, props_definition, transform) {
	const type = props_definition[prop]?.type;
	value = type === 'Boolean' && typeof value !== 'boolean' ? value != null : value;
	if (!transform || !props_definition[prop]) {
		return value;
	} else if (transform === 'toAttribute') {
		switch (type) {
			case 'Object':
			case 'Array':
				return value == null ? null : JSON.stringify(value);
			case 'Boolean':
				return value ? '' : null;
			case 'Number':
				return value == null ? null : value;
			default:
				return value;
		}
	} else {
		switch (type) {
			case 'Object':
			case 'Array':
				return value && JSON.parse(value);
			case 'Boolean':
				return value; // conversion already handled above
			case 'Number':
				return value != null ? +value : value;
			default:
				return value;
		}
	}
}

/**
 * @param {HTMLElement} element
 */
function get_custom_elements_slots(element) {
	/** @type {Record<string, true>} */
	const result = {};
	element.childNodes.forEach((node) => {
		result[/** @type {Element} node */ (node).slot || 'default'] = true;
	});
	return result;
}

/**
 * @internal
 *
 * Turn a Svelte component into a custom element.
 * @param {any} Component  A Svelte component function
 * @param {Record<string, CustomElementPropDefinition>} props_definition  The props to observe
 * @param {string[]} slots  The slots to create
 * @param {string[]} exports  Explicitly exported values, other than props
 * @param {ShadowRootInit | undefined} shadow_root_init  Options passed to shadow DOM constructor
 * @param {(ce: new () => HTMLElement) => new () => HTMLElement} [extend]
 */
export function create_custom_element(
	Component,
	props_definition,
	slots,
	exports,
	shadow_root_init,
	extend
) {
	let Class = class extends SvelteElement {
		constructor() {
			super(Component, slots, shadow_root_init);
			this.$$p_d = props_definition;
		}
		static get observedAttributes() {
			return object_keys(props_definition).map((key) =>
				(props_definition[key].attribute || key).toLowerCase()
			);
		}
	};
	object_keys(props_definition).forEach((prop) => {
		define_property(Class.prototype, prop, {
			get() {
				return this.$$c && prop in this.$$c ? this.$$c[prop] : this.$$d[prop];
			},
			set(value) {
				value = get_custom_element_value(prop, value, props_definition);
				this.$$d[prop] = value;
				var component = this.$$c;

				if (component) {
					// // If the instance has an accessor, use that instead
					var setter = get_descriptor(component, prop)?.get;

					if (setter) {
						component[prop] = value;
					} else {
						component.$set({ [prop]: value });
					}
				}
			}
		});
	});
	exports.forEach((property) => {
		define_property(Class.prototype, property, {
			get() {
				return this.$$c?.[property];
			}
		});
	});
	if (extend) {
		// @ts-expect-error - assigning here is fine
		Class = extend(Class);
	}
	Component.element = /** @type {any} */ Class;
	return Class;
}
