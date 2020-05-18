import { add_render_callback, flush, schedule_update } from './scheduler';
import { current_component, set_current_component } from './lifecycle';
import { children, detach } from './dom';
import { transition_in } from './transitions';
import { noop } from 'svelte/environment';
type binary = 0 | 1;
export interface Fragment {
	key: string | null;
	first: null;
	/* create  */ c: () => void;
	/* claim   */ l: (nodes: any) => void;
	/* hydrate */ h: () => void;
	/* mount   */ m: (target: HTMLElement, anchor: any, is_remount: binary) => void;
	/* update  */ p: (ctx: any, dirty: any) => void;
	/* measure */ r: () => void;
	/* fix     */ f: () => void;
	/* animate */ a: () => void;
	/* intro   */ i: (local: binary) => void;
	/* outro   */ o: (local: binary) => void;
	/* destroy */ d: (detaching: binary) => void;
}
// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface T$$ {
	dirty: number[];
	ctx: null | any;
	bound: any;
	update: () => void;
	callbacks: any;
	props: Record<string, 0 | string>;
	fragment: null | false | Fragment;
	context: Map<any, any>;
	on_mount: any[];
	on_destroy: any[];
	before_update: any[];
	after_update: any[];
}

export function bind({ $$: { props, bound, ctx } }, name: string, callback: (prop: any) => void) {
	if (!(name in props)) return;
	const index = props[name];
	bound[index] = callback;
	callback(ctx[index]);
}
export function mount_component({ $$ }, target, anchor) {
	if ($$.fragment) $$.fragment.m(target, anchor);
	add_render_callback(() => {
		const { on_mount, on_destroy, after_update } = $$;
		let i = 0,
			res;
		for (; i < on_mount.length; i++)
			if ('function' === typeof (res = on_mount[i]()))
				if ($$.on_destroy) on_destroy.push(res);
				else res(); // component already destroyed
		for (i = on_mount.length = 0; i < after_update.length; i++) after_update[i]();
	});
}

export function destroy_component({ $$ }, detaching: 0 | 1) {
	if (null === $$.fragment) return;

	for (let i = 0, { on_destroy } = $$; i < on_destroy.length; i++) on_destroy[i]();
	if (false !== $$.fragment) $$.fragment.d(detaching);

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

		/* state */
		props,
		update: noop,
		bound: Object.create(null),

		/* lifecycle */
		on_mount: [],
		on_destroy: [],
		before_update: [],
		after_update: [],
		context: new Map(parent_component ? parent_component.$$.context : []),

		/* everything else */
		callbacks: Object.create(null),
		dirty,
	});

	$$.ctx = instance
		? instance(component, prop_values, (i, res, ...rest) => {
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = 0 in rest ? rest[0] : res))) {
					if (i in $$.bound) $$.bound[i]($$.ctx[i]);
					if (ready) {
						if (!~$$.dirty[0]) {
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

	for (let i = 0, { before_update } = $$; i < before_update.length; i++) {
		before_update[i]();
	}

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

export const SvelteElement =
	typeof HTMLElement === 'function' &&
	class extends HTMLElement {
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
