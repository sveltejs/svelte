import { define_property } from '../internal/client/utils.js';
import * as $ from '../internal/index.js';

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
 * @param {import('./public.js').ComponentConstructorOptions<Props> & {
 * 	component: import('../main/public.js').Component<Props, Exports, Events, Slots>;
 * 	immutable?: boolean;
 * 	recover?: false;
 * }} options
 * @returns {import('./public.js').SvelteComponent<Props & Exports, Events, Slots>}
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
 * @param {import('../main/public.js').Component<Props, Exports, Events, Slots>} component
 * @returns {typeof import('./public.js').SvelteComponent<Props & Exports, Events, Slots>}
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

	/** @type {ReturnType<typeof $.createRoot>} */
	#instance;

	/**
	 * @param {import('./public.js').ComponentConstructorOptions & {
	 *  component: any;
	 * 	immutable?: boolean;
	 * 	recover?: false;
	 * }} options
	 */
	constructor(options) {
		this.#instance = $.createRoot(options.component, {
			target: options.target,
			props: { ...options.props, $$events: this.#events },
			context: options.context,
			immutable: options.immutable,
			intro: options.intro,
			recover: options.recover
		});

		for (const key of Object.keys(this.#instance)) {
			if (key === '$set' || key === '$destroy') continue;

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
