/** @import { ComponentConstructorOptions, ComponentType, SvelteComponent, Component } from 'svelte' */
import { mutable_source, set } from '../internal/client/reactivity/sources.js';
import { user_pre_effect } from '../internal/client/reactivity/effects.js';
import { hydrate, mount, unmount } from '../internal/client/render.js';
import { get } from '../internal/client/runtime.js';
import { define_property } from '../internal/client/utils.js';

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
 * 	immutable?: boolean;
 * 	hydrate?: boolean;
 * 	recover?: boolean;
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
	 * 	immutable?: boolean;
	 * 	hydrate?: boolean;
	 * 	recover?: false;
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
