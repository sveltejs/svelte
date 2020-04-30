import { add_render_callback, flush, schedule_update } from './scheduler';
import { current_component, set_current_component } from './lifecycle';
import { blank_object, is_function, run_all, noop } from './utils';
import { children, detach } from './dom';
import { transition_in } from './transitions';

export interface Fragment {
	key: string | null;
	first: null;
	/**
	 * create
	 * run once
	 * runs hydrate if exists
	 */
	c: () => void;
	/**
	 *  claim
	 *	runs hydrate if exists
	 * */

	l: (nodes: any) => void;
	/* hydrate */ h: () => void;
	/* mount   */ m: (target: HTMLElement, anchor: any, is_remount: boolean) => void;
	/* update  */ p: (ctx: any, dirty: any) => void;
	/* measure */ r: () => void;
	/* fix     */ f: () => void;
	/* animate */ a: () => void;
	/* intro   */ i: (local: 0 | 1) => void;
	/* outro   */ o: (local: 0 | 1) => void;
	/* destroy */ d: (detaching: 0 | 1) => void;
}
// eslint-disable-next-line @typescript-eslint/class-name-casing
interface T$$ {
	dirty: number[];
	ctx: null | any;
	bound: any;
	update: () => void;
	callbacks: any;
	after_update: any[];
	props: Record<string, 0 | string>;
	fragment: null | false | Fragment;
	not_equal: any;
	before_update: any[];
	context: Map<any, any>;
	on_mount: any[];
	on_destroy: any[];
}

export function bind({ $$: { props, bound, ctx } }, name: string, callback: (prop: any) => void) {
	if (!(name in props)) return;
	const index = props[name];
	bound[index] = callback;
	callback(ctx[index]);
}
export function mount_component({ $$: { fragment, on_mount, on_destroy, after_update } }, target, anchor) {
	if (fragment) fragment.m(target, anchor);
	add_render_callback(() => {
		for (let i = 0, res; i < on_mount.length; i++)
			if (is_function((res = on_mount[i]())))
				if (on_destroy) on_destroy.push(res);
				else res(); // component already destroyed
		on_mount.length = 0;
		for (let i = 0; i < after_update.length; i++) after_update[i]();
	});
}

export function destroy_component({ $$ }, detaching: 0 | 1) {
	if ($$.fragment === null) return;

	run_all($$.on_destroy);
	if ($$.fragment) $$.fragment.d(detaching);

	// TODO null out other refs, including component.$$
	// (need to preserve final state?)
	$$.on_destroy = $$.fragment = null;
	$$.ctx = [];
}

export function init(
	component: SvelteComponent,
	{ props: prop_values = {}, target, hydrate, intro, anchor },
	instance,
	create_fragment,
	not_equal,
	props,
	dirty = [-1]
) {
	let ready = false;
	const parent_component = current_component;
	set_current_component(component);

	const $$: T$$ = (component.$$ = {
		fragment: null,
		ctx: null,

		// state
		props,
		update: noop,
		not_equal,
		bound: blank_object(),

		// lifecycle
		on_mount: [],
		on_destroy: [],
		before_update: [],
		after_update: [],
		context: new Map(parent_component ? parent_component.$$.context : []),

		// everything else
		callbacks: blank_object(),
		dirty,
	});

	$$.ctx = instance
		? instance(component, prop_values, (i, res, val = res) => {
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = val))) {
					if (i in $$.bound) $$.bound[i](val);
					if (ready) {
						if (!~$$.dirty) {
							schedule_update(component);
							$$.dirty.fill(0);
						}
						$$.dirty[(i / 31) | 0] |= 1 << i % 31;
					}
				}
				return res;
		  })
		: [];

	$$.update();

	ready = true;

	run_all($$.before_update);

	// false when empty
	$$.fragment = create_fragment ? create_fragment($$.ctx) : false;

	if (target) {
		if ($$.fragment) {
			if (hydrate) {
				const nodes = children(target);
				$$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				$$.fragment.c();
			}
			if (intro) {
				transition_in($$.fragment);
			}
		} else if (hydrate) {
			children(target).forEach(detach);
		}
		mount_component(component, target, anchor);
		flush();
	}
	set_current_component(parent_component);
}

export let SvelteElement;
if (typeof HTMLElement === 'function') {
	SvelteElement = class extends HTMLElement {
		$$: T$$;
		constructor() {
			super();
			this.attachShadow({ mode: 'open' });
		}

		connectedCallback() {
			// @ts-ignore todo: improve typings
			for (const key in this.$$.slotted) {
				// @ts-ignore todo: improve typings
				this.appendChild(this.$$.slotted[key]);
			}
		}

		attributeChangedCallback(attr, _oldValue, newValue) {
			this[attr] = newValue;
		}

		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		$on(type, callback) {
			// TODO should this delegate to addEventListener?
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (~index) callbacks.splice(index, 1);
			};
		}

		// overridden by instance, if it has props
		$set() {}
	};
}

export class SvelteComponent {
	$$: T$$;
	$destroy() {
		destroy_component(this, 1);
		this.$destroy = noop;
	}
	$on(type, callback) {
		const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
		callbacks.push(callback);
		return () => {
			const index = callbacks.indexOf(callback);
			if (~index) callbacks.splice(index, 1);
		};
	}
	// overridden by instance, if it has props
	$set() {}
}
