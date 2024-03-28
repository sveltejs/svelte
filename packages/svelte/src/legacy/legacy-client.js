import { proxy } from '../internal/client/proxy.js';
import { hydrate, mount, unmount } from '../internal/client/render.js';
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
 * @param {import('svelte').ComponentConstructorOptions<Props> & {
 * 	component: import('svelte').ComponentType<import('svelte').SvelteComponent<Props, Events, Slots>>;
 * 	immutable?: boolean;
 * 	hydrate?: boolean;
 * 	recover?: boolean;
 * }} options
 * @returns {import('svelte').SvelteComponent<Props, Events, Slots> & Exports}
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
 * @param {import('svelte').SvelteComponent<Props, Events, Slots>} component
 * @returns {import('svelte').ComponentType<import('svelte').SvelteComponent<Props, Events, Slots> & Exports>}
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
	#events = {};

	/** @type {Record<string, any>} */
	#instance;

	/**
	 * @param {import('svelte').ComponentConstructorOptions & {
	 *  component: any;
	 * 	immutable?: boolean;
	 * 	hydrate?: boolean;
	 * 	recover?: false;
	 * }} options
	 */
	constructor(options) {
		// Using proxy state here isn't completely mirroring the Svelte 4 behavior, because mutations to a property
		// cause fine-grained updates to only the places where that property is used, and not the entire property.
		// Reactive statements and actions (the things where this matters) are handling this properly regardless, so it should be fine in practise.
		const props = proxy({ ...(options.props || {}), $$events: this.#events }, false);
		this.#instance = (options.hydrate ? hydrate : mount)(options.component, {
			target: options.target,
			props,
			context: options.context,
			intro: options.intro,
			recover: options.recover
		});

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
