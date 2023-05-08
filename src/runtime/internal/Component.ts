import {
	add_render_callback,
	flush,
	flush_render_callbacks,
	schedule_update,
	dirty_components
} from './scheduler';
import { current_component, set_current_component } from './lifecycle';
import { blank_object, is_empty, is_function, run, run_all, noop } from './utils';
import {
	children,
	detach,
	start_hydrating,
	end_hydrating,
	get_custom_elements_slots,
	insert
} from './dom';
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
	component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
}

export function init(
	component,
	options,
	instance,
	create_fragment,
	not_equal,
	props,
	append_styles,
	dirty = [-1]
) {
	const parent_component = current_component;
	set_current_component(component);

	const $$: T$$ = (component.$$ = {
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
	});

	append_styles && append_styles($$.root);

	let ready = false;

	$$.ctx = instance
		? instance(component, options.props || {}, (i, ret, ...rest) => {
				const value = rest.length ? rest[0] : ret;
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
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
		private $$props_definition: Record<string, CustomElementPropDefinition> = {};
		private $$listeners: Record<string, Function[]> = {};
		private $$listener_unsubscribe_fns = new Map<Function, Function>();

		constructor(
			private $$componentCtor: ComponentType,
			private $$slots: string[],
			use_shadow_dom: boolean
		) {
			super();
			if (use_shadow_dom) {
				this.attachShadow({ mode: 'open' });
			}
		}

		addEventListener(type: string, listener: any, options?: any): void {
			// We can't determine upfront if the event is a custom event or not, so we have to
			// listen to both. If someone uses a custom event with the same name as a regular
			// browser event, this fires twice - we can't avoid that.
			this.$$listeners[type] = this.$$listeners[type] || [];
			this.$$listeners[type].push(listener);
			if (this.$$component) {
				const unsub = this.$$component!.$on(type, listener);
				this.$$listener_unsubscribe_fns.set(listener, unsub);
			}
			super.addEventListener(type, listener, options);
		}

		removeEventListener(type: string, listener: any, options?: any): void {
			super.removeEventListener(type, listener, options);
			if (this.$$component) {
				const unsub = this.$$listener_unsubscribe_fns.get(listener);
				if (unsub) {
					unsub();
					this.$$listener_unsubscribe_fns.delete(listener);
				}
			}
		}

		async connectedCallback() {
			this.$$connected = true;
			if (!this.$$component) {
				// We wait one tick to let possible child slot elements be created/mounted
				await Promise.resolve();

				if (!this.$$connected) {
					return;
				}

				function create_slot(name: string) {
					return () => {
						let node: HTMLSlotElement;
						const obj = {
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
									detach(node);
								}
							}
						};
						return obj;
					};
				}

				const $$slots: Record<string, any> = {};
				const existing_slots = get_custom_elements_slots(this);
				for (const name of this.$$slots) {
					if (name in existing_slots) {
						$$slots[name] = [create_slot(name)];
					}
				}

				for (const attribute of this.attributes) {
					// this.$$data takes precedence over this.attributes
					const name = this.$$get_prop_name(attribute.name);
					if (!(name in this.$$data)) {
						this.$$data[name] = get_custom_element_value(
							name,
							attribute.value,
							this.$$props_definition,
							'toProp'
						);
					}
				}

				this.$$component = new this.$$componentCtor({
					target: this.shadowRoot || this,
					props: {
						...this.$$data,
						$$slots,
						$$scope: {
							ctx: []
						}
					}
				});

				for (const type in this.$$listeners) {
					for (const listener of this.$$listeners[type]) {
						const unsub = this.$$component!.$on(type, listener);
						this.$$listener_unsubscribe_fns.set(listener, unsub);
					}
				}
				this.$$listeners = {};
			}
		}

		// We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
		// and setting attributes through setAttribute etc, this is helpful
		attributeChangedCallback(attr: string, _oldValue: any, newValue: any) {
			if (this.$$reflecting) return;

			attr = this.$$get_prop_name(attr);
			this.$$data[attr] = get_custom_element_value(
				attr,
				newValue,
				this.$$props_definition,
				'toProp'
			);
			this.$$component!.$set({ [attr]: this.$$data[attr] });
		}

		disconnectedCallback() {
			this.$$connected = false;
			// In a microtask, because this could be a move within the DOM
			Promise.resolve().then(() => {
				if (!this.$$connected) {
					this.$$component!.$destroy();
					this.$$component = undefined;
				}
			});
		}

		private $$get_prop_name(attribute_name: string): string {
			return (
				Object.keys(this.$$props_definition).find(
					(key) =>
						this.$$props_definition[key].attribute === attribute_name ||
						(!this.$$props_definition[key].attribute && key.toLowerCase() === attribute_name)
				) || attribute_name
			);
		}
	};
}

function get_custom_element_value(
	prop: string,
	value: any,
	props_definition: Record<string, CustomElementPropDefinition>,
	transform?: 'toAttribute' | 'toProp'
) {
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

interface CustomElementPropDefinition {
	attribute?: string;
	reflect?: boolean;
	type?: 'String' | 'Boolean' | 'Number' | 'Array' | 'Object';
}

/**
 * @internal
 *
 * Turn a Svelte component into a custom element.
 * @param Component A Svelte component constructor
 * @param props_definition The props to observe
 * @param slots The slots to create
 * @param accessors Other accessors besides the ones for props the component has
 * @param use_shadow_dom Whether to use shadow DOM
 * @returns A custom element class
 */
export function create_custom_element(
	Component: ComponentType,
	props_definition: Record<string, CustomElementPropDefinition>,
	slots: string[],
	accessors: string[],
	use_shadow_dom: boolean
) {
	const Class = class extends SvelteElement {
		constructor() {
			super(Component, slots, use_shadow_dom);
			this.$$props_definition = props_definition;
		}

		static get observedAttributes() {
			return Object.keys(props_definition).map((key) =>
				(props_definition[key].attribute || key).toLowerCase()
			);
		}
	};

	Object.keys(props_definition).forEach((prop) => {
		Object.defineProperty(Class.prototype, prop, {
			get() {
				return this.$$component && prop in this.$$component
					? this.$$component[prop]
					: this.$$data[prop];
			},

			set(value) {
				value = get_custom_element_value(prop, value, props_definition);
				this.$$data[prop] = value;
				this.$$component?.$set({ [prop]: value });

				if (props_definition[prop].reflect) {
					this.$$reflecting = true;
					const attribute_value = get_custom_element_value(
						prop,
						value,
						props_definition,
						'toAttribute'
					);
					if (attribute_value == null) {
						this.removeAttribute(prop);
					} else {
						this.setAttribute(props_definition[prop].attribute || prop, attribute_value as string);
					}
					this.$$reflecting = false;
				}
			}
		});
	});

	accessors.forEach((accessor) => {
		Object.defineProperty(Class.prototype, accessor, {
			get() {
				return this.$$component?.[accessor];
			}
		});
	});

	Component.element = Class as any;

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
		const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
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
