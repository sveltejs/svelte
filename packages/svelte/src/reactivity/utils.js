import { DEV } from 'esm-env';
import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';

export const NOTIFY_WITH_ALL_REGISTERED_PARAMS = Symbol();
export const INTERNAL_OBJECT = Symbol();

/**
 * some `write_properties` require a custom logic to notify a change for read properties.
 * for instance calling `set.add(2)` two times should not cause reactivity the second time.
 * interceptor is called before the call is proxied to the actual object, so we can decide wether a change
 * is actually going to happen or not.
 * - if a `write_property` shouldn't increment the `version` signal return false from the interceptor. note that calling `notify_read_properties` WILL increase the `version` in all cases.
 * returning false is only useful if do it before calling `notify_read_properties` like an if-guard that returns false early because no change has happened.
 * - DO NOT USE INTERCEPTORS FOR READ PROPERTIES
 * @template TEntityInstance
 * @template {(keyof TEntityInstance)[]} TWriteProperties
 * @template {(keyof TEntityInstance)[]} TReadProperties
 * @typedef {Partial<Record<TWriteProperties[number], (notify_read_properties: (methods: TReadProperties, ...params: unknown[])=>void ,value: TEntityInstance, property: TWriteProperties[number], ...params: unknown[])=>boolean>>} Interceptors
 */

/**
 * @template TEntityInstance
 * @template {(keyof TEntityInstance)[]} TWriteProperties
 * @template {(keyof TEntityInstance)[]} TReadProperties
 * @typedef {object} Options
 * @prop {TWriteProperties} write_properties - an array of property names on `TEntityInstance`, could cause reactivity.
 * @prop {TReadProperties} [read_properties] - an array of property names on `TEntityInstance` that `write_properties` affect,
 *  typically used for methods. note that properties that are listed here don't depend on version_signal anymore and you have to
 *  notify changes yourself. for instance `size` doesn't need to be here because it takes no parameters and is reactive based on the `version` signal.
 * @prop {Interceptors<TEntityInstance, TWriteProperties, TReadProperties>} [interceptors] - an object of interceptors for `write_properties` that can customize how/when a `read_properties` should be notified of a change.
 */

/** @typedef {Map<string | symbol | number, Map<unknown, import("#client").Source<boolean>>>} ReadMethodsSignals */

/**
 * @template {new (...args: any) => any} TEntity
 * @template {(keyof InstanceType<TEntity>)[]} TWriteProperties
 * @template {(keyof InstanceType<TEntity>)[]} TReadProperties
 * @param {TEntity} Entity - the entity we want to make reactive
 * @param {Options<InstanceType<TEntity>, TWriteProperties, TReadProperties>} options - configurations for how reactivity works for this entity
 * @returns {TEntity}
 */
export const make_reactive = (Entity, options) => {
	override_console();

	// we return a class so that the caller can call it with new
	// @ts-ignore
	return class extends Entity {
		/**
		 * each read method can be tracked like has, get, has and etc. these props might depend on a parameter. they have to reactive based on the
		 * parameter they depend on. for instance if you have `set.has(2)` and then call `set.add(5)` the former shouldn't get notified.
		 * based on that we need to store the function_name + parameter(s).
		 * @type {ReadMethodsSignals}
		 **/
		#read_methods_signals = new Map();

		/**
		 * other props that get notified based on any change listen to version
		 */
		#version_signal = source(false);

		[INTERNAL_OBJECT] = this;

		/**
		 * @param  {...unknown[]} params
		 */
		constructor(...params) {
			super(...params);
			return new Proxy(this, {
				get: (target, property) => {
					const orig_property = target[/**@type {keyof typeof target}*/ (property)];
					let result;

					if (typeof orig_property === 'function') {
						// bind functions directly to the `TEntity`
						result = ((/** @type {unknown[]} */ ...params) => {
							const notifiers = create_notifiers(
								target.#version_signal,
								target.#read_methods_signals,
								property,
								/**@type {InstanceType<TEntity>}*/ (target),
								options,
								...params
							);
							const function_result = orig_property.bind(target)(...params);
							// causing reactivity after the function is actually called and performed its changes
							get_read_signals(
								target.#version_signal,
								target.#read_methods_signals,
								property,
								options,
								...params
							);
							notifiers.forEach((notifier) => notifier());
							return function_result;
						}).bind(target);
					} else {
						// handle getters/props
						result = Reflect.get(target, property);
						get_read_signals(
							target.#version_signal,
							target.#read_methods_signals,
							property,
							options
						);
					}

					return result;
				},
				set(target, property, value) {
					const notifiers = create_notifiers(
						target.#version_signal,
						target.#read_methods_signals,
						property,
						/**@type {InstanceType<TEntity>}*/ (target),
						options,
						value
					);
					const result = Reflect.set(target, property, value);
					notifiers.forEach((notifier) => notifier());
					return result;
				},
				ownKeys: (target) => {
					// to make it work with $inspect
					get(target.#version_signal);
					return Reflect.ownKeys(target);
				}
			});
		}
	};
};

/**
 * creates an array of functions that notify other signals based on the changes, you need to run these functions to invoke reactivity
 * @template {new (...args: any) => any} TEntity
 * @template {(keyof TEntityInstance)[]} TWriteProperties
 * @template {(keyof TEntityInstance)[]} TReadProperties
 * @template {InstanceType<TEntity>} TEntityInstance
 * @template {keyof TEntityInstance} TProperty
 * @param {import('#client').Source<boolean>} version_signal
 * @param {ReadMethodsSignals} read_methods_signals
 * @param {TProperty} property
 * @param {TEntityInstance} entity_instance
 * @param {Options<InstanceType<TEntity>, TWriteProperties, TReadProperties>} options
 * @param {unknown[]} params
 * @returns {Function[]}
 */
function create_notifiers(
	version_signal,
	read_methods_signals,
	property,
	entity_instance,
	options,
	...params
) {
	const initial_version_signal_v = version_signal.v;

	/**
	 * @type {Function[]}
	 */
	const notifiers = [];

	const interceptor =
		options.interceptors &&
		Object.hasOwn(options.interceptors, property) &&
		options.interceptors?.[property];

	if (interceptor) {
		const increment_version_signal =
			interceptor(
				(methods, ...params) => {
					notifiers.push(() => {
						notify_read_properties(
							options,
							version_signal,
							initial_version_signal_v,
							read_methods_signals,
							methods,
							...params
						);
					});
				},
				entity_instance,
				property,
				...params
			) === true;

		if (!increment_version_signal) {
			return notifiers;
		}
	}

	notifiers.push(() => {
		if (options.write_properties.some((v) => v === property)) {
			increment_signal(initial_version_signal_v, version_signal);
		}
	});

	return notifiers;
}

/**
 * @template {new (...args: any) => any} TEntity
 * @template {(keyof TEntityInstance)[]} TWriteProperties
 * @template {(keyof TEntityInstance)[]} TReadProperties
 * @template {InstanceType<TEntity>} TEntityInstance
 * @template {keyof TEntityInstance} TProperty
 * @param {import('#client').Source<boolean>} version_signal
 * @param {ReadMethodsSignals} read_methods_signals
 * @param {TProperty} property
 * @param {Options<InstanceType<TEntity>, TWriteProperties, TReadProperties>} options
 * @param {unknown[]} params
 */

function get_read_signals(version_signal, read_methods_signals, property, options, ...params) {
	if (options.read_properties?.includes(property)) {
		(params.length == 0 ? [null] : params).forEach((param) => {
			// read like methods that are reactive conditionally should create the signal (if not already created)
			// so they can be reactive when notified based on their param
			const sig = get_signal_for_function(read_methods_signals, property, param, true);
			get(sig);
		});
	} else if (!options.write_properties.includes(property)) {
		// other read like methods that are not reactive conditionally based their params and are just notified based on the version signal are here
		get(version_signal);
	}
}

/**
 * @template {new (...args: any) => any} TEntity
 * @template {(keyof TEntityInstance)[]} TWriteProperties
 * @template {(keyof TEntityInstance)[]} TReadProperties
 * @template {InstanceType<TEntity>} TEntityInstance
 * @param {ReadMethodsSignals} read_methods_signals
 * @param {Options<InstanceType<TEntity>, TWriteProperties, TReadProperties>} options
 * @param {import('#client').Source<boolean>} version_signal
 * @param {boolean} initial_version_signal_v
 * @param {TReadProperties | undefined} method_names
 * @param {unknown[]} params - if you want to notify for all parameters pass the `NOTIFY_WITH_ALL_PARAMS` constant instead, for instance some methods like `clear` should notify all `something.get(x)` methods;
 */
function notify_read_properties(
	options,
	version_signal,
	initial_version_signal_v,
	read_methods_signals,
	method_names,
	...params
) {
	method_names?.forEach((name) => {
		if (DEV && !options.read_properties?.includes(name)) {
			throw new Error(
				`when trying to notify reactions got a read method that wasn't defined in options: ${name.toString()}`
			);
		}
		if (params.length == 1 && params[0] == NOTIFY_WITH_ALL_REGISTERED_PARAMS) {
			read_methods_signals.get(name)?.forEach((sig) => {
				increment_signal(initial_version_signal_v, version_signal, sig);
			});
		} else {
			(params.length == 0 ? [null] : params).forEach((param) => {
				const sig = get_signal_for_function(read_methods_signals, name, param);
				sig && increment_signal(initial_version_signal_v, version_signal, sig);
			});
		}
	});
}

/**
 * gets the signal for this function based on params. If the signal doesn't exist and `create_signal_if_doesnt_exist` is not set to true, it creates a new one and returns that
 * @template {boolean} [TCreateSignalIfDoesntExist=false]
 * @param {ReadMethodsSignals} signals_map
 * @param {string | symbol | number} function_name
 * @param {unknown} param
 * @param {TCreateSignalIfDoesntExist} [create_signal_if_doesnt_exist=false]
 * @returns {TCreateSignalIfDoesntExist extends true ? import("#client").Source<boolean> : import("#client").Source<boolean> | null }
 */
function get_signal_for_function(
	signals_map,
	function_name,
	param,
	// @ts-ignore: this should be supported in jsdoc based on https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#template but isn't?
	create_signal_if_doesnt_exist = false
) {
	/**
	 * @type {Map<unknown, import("#client").Source<boolean>>}
	 */
	let params_to_signal_map;
	if (!signals_map.has(function_name)) {
		if (!create_signal_if_doesnt_exist) {
			// @ts-ignore
			return null;
		}
		params_to_signal_map = new Map([[param, source(false)]]);
		signals_map.set(function_name, params_to_signal_map);
	} else {
		params_to_signal_map = /**
		 * @type {Map<unknown[], import("#client").Source<boolean>>}
		 */ (signals_map.get(function_name));
	}

	/**
	 * @type {import("#client").Source<boolean>}
	 */
	let signal;
	if (!params_to_signal_map.has(param)) {
		if (!create_signal_if_doesnt_exist) {
			// @ts-ignore
			return null;
		}
		signal = source(false);
		params_to_signal_map.set(param, signal);
	} else {
		signal = /**
		 * @type {import("#client").Source<boolean>}
		 */ (params_to_signal_map.get(param));
	}
	// @ts-ignore
	return signal;
}

/**
 * toggles the signal value. this change notifies any reactions (not using number explicitly cause its not required, change from true to false or vice versa is enough).
 * @param {boolean} initial_version_signal_v  - this prevents changing the version signal multiple times in a single changeset
 * @param {import("#client").Source<boolean>} version_signal
 * @param {import("#client").Source<boolean>} [read_method_signal]
 */
function increment_signal(initial_version_signal_v, version_signal, read_method_signal) {
	if (initial_version_signal_v === version_signal.v) {
		set(version_signal, !version_signal.v);
	}
	read_method_signal && set(read_method_signal, !read_method_signal.v);
}

let is_console_overridden = false;
function override_console() {
	if (!DEV || is_console_overridden) {
		return;
	}
	is_console_overridden = true;

	const methods = /** @type {const} */ (['log', 'error', 'warn', 'debug', 'dir', 'table']);

	/**
	 * @param {any} value
	 * @returns {any}
	 */
	function get_internal_obj(value) {
		if (typeof value === 'object' && value !== null && INTERNAL_OBJECT in value) {
			return value[INTERNAL_OBJECT];
		}
		return value;
	}

	/**
	 * @param {typeof methods[number]} method
	 */
	function override(method) {
		// eslint-disable-next-line no-console
		const original_method = console[method];

		/**
		 * @type {any[]}
		 **/
		// eslint-disable-next-line no-console
		console[method] = (...params) => {
			return original_method(...params.map((value) => get_internal_obj(value)));
		};
	}

	methods.forEach((method) => {
		override(method);
	});
}
