import { add_render_callback, flush, flush_render_callbacks, schedule_update, dirty_components, tick } from './scheduler';
import { current_component, set_current_component } from './lifecycle';
import { blank_object, is_empty, is_function, run, run_all, noop } from './utils';
import { children, detach, start_hydrating, end_hydrating, set_custom_element_data, get_custom_elements_slots, insert } from './dom';
import { transition_in } from './transitions';
import { T$$ } from './types';
import { ComponentType } from './dev';

export function bind(component, name, callback) {
	const index = component.$$.props[name];
	if (index !== undefined) {
		component.$$.bound[index] = callback;
		callback(component.$$.ctx[index]);
	}
}

export function create_component(block) {
	block && block.c();
}

export function claim_component(block, parent_nodes) {
	block && block.l(parent_nodes);
}

export function mount_component(component, target, anchor) {
	const { fragment, after_update } = component.$$;

	fragment && fragment.m(target, anchor);

	// onMount happens before the initial afterUpdate
	add_render_callback(() => {

		const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
		// if the component was destroyed immediately
		// it will update the `$$.on_destroy` reference to `null`.
		// the destructured on_destroy may still reference to the old array
		if (component.$$.on_destroy) {
			component.$$.on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});

	after_update.forEach(add_render_callback);
}

export function destroy_component(component, detaching) {
	const $$ = component.$$;
	if ($$.fragment !== null) {
		flush_render_callbacks($$.after_update);

		run_all($$.on_destroy);

		$$.fragment && $$.fragment.d(detaching);

		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		$$.on_destroy = $$.fragment = null;
		$$.ctx = [];
	}
}

function make_dirty(component, i) {
	if (component.$$.dirty[0] === -1) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty.fill(0);
	}
	component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}

export function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
	const parent_component = current_component;
	set_current_component(component);

	const $$: T$$ = component.$$ = {
		fragment: null,
		ctx: [],

		// state
		props,
		update: noop,
		not_equal,
		bound: blank_object(),

		// lifecycle
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),

		// everything else
		callbacks: blank_object(),
		dirty,
		skip_bound: false,
		root: options.target || parent_component.$$.root
	};

	append_styles && append_styles($$.root);

	let ready = false;

	$$.ctx = instance
		? instance(component, options.props || {}, (i, ret, ...rest) => {
			const value = rest.length ? rest[0] : ret;
			if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
				if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
				if (ready) make_dirty(component, i);
			}
			return ret;
		})
		: [];

	$$.update();
	ready = true;
	run_all($$.before_update);

	// `false` as a special case of no DOM component
	$$.fragment = create_fragment ? create_fragment($$.ctx) : false;

	if (options.target) {
		if (options.hydrate) {
			start_hydrating();
			const nodes = children(options.target);
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment!.l(nodes);
			nodes.forEach(detach);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment!.c();
		}

		if (options.intro) transition_in(component.$$.fragment);
		mount_component(component, options.target, options.anchor);
		end_hydrating();
		flush();
	}

	set_current_component(parent_component);
}

export let SvelteElement;
if (typeof HTMLElement === 'function') {
	SvelteElement = class extends HTMLElement {
		private $$component?: SvelteComponent;
		private $$connected = false;
		private $$data = {};
		private $$reflecting = false;

		constructor(
			private $$componentCtor: ComponentType,
			private $$slots: string[],
		) {
			super();
			this.attachShadow({ mode: 'open' });
		}

		addEventListener(type: string, listener: any, options?: any): void {
			// We can't determine upfront if the event is a custom event or not, so we have to
			// listen to both. If someone uses a custom event with the same name as a regular
			// browser event, this fires twice - we can't avoid that.
			this.$$component!.$on(type, listener);
			super.addEventListener(type, listener, options);
		}

		connectedCallback() {
			this.$$connected = true;
			if (!this.$$component) {
				for (const attribute of this.attributes) {
					// this.$$data takes precedence over this.attributes
					if (!(attribute.name in this.$$data)) {
						this.$$data[attribute.name] = attribute.value;
					}
				}

				function create_slot(name: string) {
					return () => {
						let node: HTMLSlotElement;
						return {
							c: function create() {
								node = document.createElement('slot');
								if (name !== 'default') {
									node.setAttribute('name', name);
								}
							},
							m: function mount(target: HTMLElement, anchor?: HTMLElement) {
								insert(target, node, anchor);
							},
							d: function destroy(detaching: boolean) {
								if (detaching) {
									detach(node)
								}
							},
							$$c_e: true
						};
					};
				}

				let $$slots: Record<string, any> = {};
				const existing_slots = get_custom_elements_slots(this);
				for (const name of this.$$slots) {
					if (name in existing_slots) {
						$$slots[name] = [create_slot(name)];
					}
				}

				// Dilemma: We need to set the component props eagerly or they have the wrong value for actions/onMount etc.
				// Boolean attributes are represented by the empty string, and we don't know if they represent boolean or string props.
				this.$$component = new this.$$componentCtor({
					target: this.shadowRoot!,
					props: {
						$$slots,
						$$scope: {
							ctx: []
						}
					}
				});
				// ensures that <foo-bar boolean-attribute /> works correctly
				Object.keys(this.$$data).forEach(key => {
					set_custom_element_data(this, key, this.$$data[key]);
					this.$$data[key] = this[key]; // "" -> true for boolean attributes
				});
			}
		}

		// TODO we don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
		// and setting attributes through setAttribute etc, this is probably helpful
		attributeChangedCallback(attr: string, _oldValue: any, newValue: any) {
			if (this.$$reflecting) return;

			set_custom_element_data(this.$$data, attr, newValue);
			this.$$component![attr] = this.$$data;
		}

		disconnectedCallback() {
			this.$$connected = false;
			// In a microtask, because this could be a move within the DOM
			tick().then(() => {
				if (!this.$$connected) {
					this.$$component!.$destroy();
					this.$$component = undefined;
				}
			});
		}
	};
}

/**
 * Attribute value types that should be reflected to the DOM. Helpful
 * for people relying on the custom element's attributes to be present,
 * for example when using a CSS selector which relies on an attribute.
 */
const should_reflect = ['string', 'number', 'boolean'];

function camelToHyphen(str: string) {
	return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Turn a Svelte component into a custom element.
 * @param Component A Svelte component constructor
 * @param props The props to observe
 * @param slots The slots to create
 * @param accessors Other accessors besides the ones for props the component has
 * @param styles Additional styles to apply to the shadow root (not needed for Svelte components compiled with `customElement: true`)
 * @returns A custom element class
 */
export function create_custom_element(
	Component: ComponentType,
	props: string[],
	slots: string[],
	accessors: string[],
	styles?: string,
) {
	const Class = class extends SvelteElement {
		constructor() {
			super(Component, slots);
			if (styles) {
				const style = document.createElement('style');
				style.textContent = styles;
				this.shadowRoot!.appendChild(style);
			}
		}

		static get observedAttributes() {
			return props;
		}
	};

	function createProperty(name: string, prop: string) {
		Object.defineProperty(Class.prototype, name, {
			get() {
				return this.$$component && prop in this.$$component
					? this.$$component[prop]
					: this.$$data[prop];
			},

			set(value) {
				this.$$data[prop] = value;

				if (this.$$component) {
					if(should_reflect.indexOf(typeof value) !== -1) {
						this.$$reflecting = true;
						if (value === false || value == null) {
							this.removeAttribute(prop);
						} else {
							this.setAttribute(prop, value);
						}
						this.$$reflecting = false;
					}

					this.$$component[prop] = value;
				}
			}
		})
	}

	props.forEach((prop) => {
		createProperty(prop, prop);
		// <c-e camelCase="foo" /> will be ce.camcelcase = "foo"
		const lower = prop.toLowerCase();
		if (lower !== prop) {
			createProperty(lower, prop);
		}
		// also support hyphenated version where <c-e camel-case="foo" /> will be ce['camel-case'] = "foo"
		const hyphen = camelToHyphen(prop);
		if (hyphen !== lower) {
			createProperty(hyphen, prop)
		}
	});

	accessors.forEach(accessor => {
		Object.defineProperty(Class.prototype, accessor, {
			get() {
				return this.$$component?.[accessor];
			},
		})
	});

	return Class;
}

/**
 * Base class for Svelte components. Used when dev=false.
 */
export class SvelteComponent {
	$$: T$$;
	$$set?: ($$props: any) => void;

	$destroy() {
		destroy_component(this, 1);
		this.$destroy = noop;
	}

	$on(type, callback) {
		if (!is_function(callback)) {
			return noop;
		}
		const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
		callbacks.push(callback);

		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	$set($$props) {
		if (this.$$set && !is_empty($$props)) {
			this.$$.skip_bound = true;
			this.$$set($$props);
			this.$$.skip_bound = false;
		}
	}
}
