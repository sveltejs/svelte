import { add_render_callback, flush, flush_render_callbacks, schedule_update, dirty_components } from './scheduler';
import { current_component, set_current_component } from './lifecycle';
import { blank_object, is_empty, is_function, run, run_all, noop } from './utils';
import { children, detach, start_hydrating, end_hydrating } from './dom';
import { transition_in } from './transitions';
import { T$$ } from './types';

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

export function mount_component(component, target, anchor, customElement) {
	const { fragment, after_update } = component.$$;

	fragment && fragment.m(target, anchor);

	if (!customElement) {
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
	}

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
		mount_component(component, options.target, options.anchor, options.customElement);
		end_hydrating();
		flush();
	}

	set_current_component(parent_component);
}

export let SvelteElement;
if (typeof HTMLElement === 'function') {
	SvelteElement = class extends HTMLElement {
		$$: T$$;
		$$set?: ($$props: any) => void;
		constructor() {
			super();
			this.attachShadow({ mode: 'open' });
		}

		connectedCallback() {
			const { on_mount } = this.$$;
			this.$$.on_disconnect = on_mount.map(run).filter(is_function);

			// @ts-ignore todo: improve typings
			for (const key in this.$$.slotted) {
				// @ts-ignore todo: improve typings
				this.appendChild(this.$$.slotted[key]);
			}
		}

		attributeChangedCallback(attr, _oldValue, newValue) {
			this[attr] = newValue;
		}

		disconnectedCallback() {
			run_all(this.$$.on_disconnect);
		}

		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		$on(type, callback) {
			// TODO should this delegate to addEventListener?
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
	};
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
