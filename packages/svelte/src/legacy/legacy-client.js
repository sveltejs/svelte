/** @import { ComponentConstructorOptions, ComponentType, SvelteComponent, Component } from 'svelte' */
import { user_pre_effect } from '../internal/client/reactivity/effects.js';
import { mutable_source, set } from '../internal/client/reactivity/sources.js';
import { hydrate, mount, unmount } from '../internal/client/render.js';
import { component_context, flush_sync, get } from '../internal/client/runtime.js';
import { lifecycle_outside_component } from '../internal/shared/errors.js';
import { define_property, is_array } from '../internal/shared/utils.js';

/**
 * Takes the same options as a Svelte 4 component and the component function and returns a Svelte 4 compatible component.
 *
 * @deprecated Use this only as a temporary solution to migrate your imperative component code to Svelte 5.
 *
 * @template {Record<string, any>} Props
 * @template {Record<string, any>} Exports
 * @template {Record<string, any>} Events
 * @template {Record<string, any>} Slots
 *
 * @param {ComponentConstructorOptions<Props> & {
 * 	component: ComponentType<SvelteComponent<Props, Events, Slots>> | Component<Props>;
 * }} options
 * @returns {SvelteComponent<Props, Events, Slots> & Exports}
 */
export function createClassComponent(options) {
	// @ts-expect-error $$prop_def etc are not actually defined
	return new Svelte4Component(options);
}

/**
 * Takes the component function and returns a Svelte 4 compatible component constructor.
 *
 * @deprecated Use this only as a temporary solution to migrate your imperative component code to Svelte 5.
 *
 * @template {Record<string, any>} Props
 * @template {Record<string, any>} Exports
 * @template {Record<string, any>} Events
 * @template {Record<string, any>} Slots
 *
 * @param {SvelteComponent<Props, Events, Slots> | Component<Props>} component
 * @returns {ComponentType<SvelteComponent<Props, Events, Slots> & Exports>}
 */
export function asClassComponent(component) {
	// @ts-expect-error $$prop_def etc are not actually defined
	return class extends Svelte4Component {
		/** @param {any} options */
		constructor(options) {
			super({
				component,
				...options
			});
		}
	};
}

class Svelte4Component {
	/** @type {any} */
	#events;

	/** @type {Record<string, any>} */
	#instance;

	/**
	 * @param {ComponentConstructorOptions & {
	 *  component: any;
	 * }} options
	 */
	constructor(options) {
		var sources = new Map();

		/**
		 * @param {string | symbol} key
		 * @param {unknown} value
		 */
		var add_source = (key, value) => {
			var s = mutable_source(value);
			sources.set(key, s);
			return s;
		};

		// Replicate coarse-grained props through a proxy that has a version source for
		// each property, which is increment on updates to the property itself. Do not
		// use our $state proxy because that one has fine-grained reactivity.
		const props = new Proxy(
			{ ...(options.props || {}), $$events: {} },
			{
				get(target, prop) {
					return get(sources.get(prop) ?? add_source(prop, Reflect.get(target, prop)));
				},
				has(target, prop) {
					get(sources.get(prop) ?? add_source(prop, Reflect.get(target, prop)));
					return Reflect.has(target, prop);
				},
				set(target, prop, value) {
					set(sources.get(prop) ?? add_source(prop, value), value);
					return Reflect.set(target, prop, value);
				}
			}
		);

		this.#instance = (options.hydrate ? hydrate : mount)(options.component, {
			target: options.target,
			props,
			context: options.context,
			intro: options.intro ?? false,
			recover: options.recover
		});

		// We don't flush_sync for custom element wrappers or if the user doesn't want it
		if (!options?.props?.$$host || options.sync === false) {
			flush_sync();
		}

		this.#events = props.$$events;

		for (const key of Object.keys(this.#instance)) {
			if (key === '$set' || key === '$destroy' || key === '$on') continue;
			define_property(this, key, {
				get() {
					return this.#instance[key];
				},
				/** @param {any} value */
				set(value) {
					this.#instance[key] = value;
				},
				enumerable: true
			});
		}

		this.#instance.$set = /** @param {Record<string, any>} next */ (next) => {
			Object.assign(props, next);
		};

		this.#instance.$destroy = () => {
			unmount(this.#instance);
		};
	}

	/** @param {Record<string, any>} props */
	$set(props) {
		this.#instance.$set(props);
	}

	/**
	 * @param {string} event
	 * @param {(...args: any[]) => any} callback
	 * @returns {any}
	 */
	$on(event, callback) {
		this.#events[event] = this.#events[event] || [];

		/** @param {any[]} args */
		const cb = (...args) => callback.call(this, ...args);
		this.#events[event].push(cb);
		return () => {
			this.#events[event] = this.#events[event].filter(/** @param {any} fn */ (fn) => fn !== cb);
		};
	}

	$destroy() {
		this.#instance.$destroy();
	}
}

/**
 * Runs the given function once immediately on the server, and works like `$effect.pre` on the client.
 *
 * @deprecated Use this only as a temporary solution to migrate your component code to Svelte 5.
 * @param {() => void | (() => void)} fn
 * @returns {void}
 */
export function run(fn) {
	user_pre_effect(fn);
}

/**
 * Function to mimic the multiple listeners available in svelte 4
 * @deprecated
 * @param {EventListener[]} handlers
 * @returns {EventListener}
 */
export function handlers(...handlers) {
	return function (event) {
		const { stopImmediatePropagation } = event;
		let stopped = false;

		event.stopImmediatePropagation = () => {
			stopped = true;
			stopImmediatePropagation.call(event);
		};

		const errors = [];

		for (const handler of handlers) {
			try {
				// @ts-expect-error `this` is not typed
				handler?.call(this, event);
			} catch (e) {
				errors.push(e);
			}

			if (stopped) {
				break;
			}
		}

		for (let error of errors) {
			queueMicrotask(() => {
				throw error;
			});
		}
	};
}

/**
 * Function to create a `bubble` function that mimic the behavior of `on:click` without handler available in svelte 4.
 * @deprecated Use this only as a temporary solution to migrate your automatically delegated events in Svelte 5.
 */
export function createBubbler() {
	const active_component_context = component_context;
	if (active_component_context === null) {
		lifecycle_outside_component('createBubbler');
	}

	return (/**@type {string}*/ type) => (/**@type {Event}*/ event) => {
		const events = /** @type {Record<string, Function | Function[]>} */ (
			active_component_context.s.$$events
		)?.[/** @type {any} */ (type)];

		if (events) {
			const callbacks = is_array(events) ? events.slice() : [events];
			for (const fn of callbacks) {
				fn.call(active_component_context.x, event);
			}
			return !event.defaultPrevented;
		}
		return true;
	};
}

export {
	once,
	preventDefault,
	self,
	stopImmediatePropagation,
	stopPropagation,
	trusted,
	passive,
	nonpassive
} from '../internal/client/dom/legacy/event-modifiers.js';
