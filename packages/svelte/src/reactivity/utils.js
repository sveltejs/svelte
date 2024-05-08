import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';

/**
 * @template TEntityInstance
 * @template {(keyof TEntityInstance)[]} TMutationProperties
 * @typedef {Partial<Record<TMutationProperties[number], (value: TEntityInstance, property: TMutationProperties[number], ...params: unknown[])=>boolean>>}  Interceptors - return false if you want to prevent reactivity for this call/get
 */

/**
 * @template TEntityInstance
 * @template {(keyof TEntityInstance)[]} TMutationProperties
 * @typedef {object} Options
 * @prop {TMutationProperties} mutation_properties - an array of property names on `TEntityInstance`. when calling a property on `TEntityInstance`, if the property name exists in this array, then mentioned property causes reactivity.
 * @prop {Interceptors<TEntityInstance, (keyof TEntityInstance)[]>} [interceptors={}] - if the property names in `mutation_properties` shouldn't cause reactivity, such calling `set.add(2)` twice or accessing a property shouldn't be reactive based on some conditions, you can prevent the reactivity by returning `false` from these interceptors
 */

/**
 * @template {new (...args: any) => any} TEntity - the entity we want to make reactive
 * @template {(keyof InstanceType<TEntity>)[]} TMutationProperties
 * @param {TEntity} Entity - the class/function we want to make reactive
 * @param {Options<InstanceType<TEntity>, TMutationProperties>} options - configurations for how reactivity works for this entity
 * @returns {TEntity}
 */
export const make_reactive = (Entity, options) => {
	/**
	 * @template {InstanceType<TEntity>} TEntityInstance
	 * @template {keyof TEntityInstance} TProperty
	 * @param {import('#client').Source<number>} target
	 * @param {TProperty} property
	 * @param {TEntityInstance} entity_instance
	 * @param {unknown[]} params
	 */
	function notify_if_required(target, property, entity_instance, ...params) {
		if (options.interceptors?.[property]?.(entity_instance, property, ...params) === false) {
			// if interceptor said to not make this call reactive then bailout
			return;
		}

		if (options.mutation_properties.some((v) => v === property)) {
			set(target, target.v + 1);
		} else {
			get(target);
		}
	}

	// we return a class so that the caller can call it with new
	// @ts-ignore
	return class {
		/**
		 * @param {ConstructorParameters<TEntity>}  params
		 */
		constructor(...params) {
			const sig = source(0);

			return new Proxy(new Entity(...params), {
				get(target, property) {
					const orig_property = target[property];

					let result;

					if (typeof orig_property === 'function') {
						// Bind functions directly to the Set
						result = ((/** @type {any} */ ...params) => {
							notify_if_required(sig, property, target, ...params);
							return orig_property.bind(target)(...params);
						}).bind(target);
					} else {
						// Properly handle getters
						result = Reflect.get(target, property, target);
						notify_if_required(sig, property, target);
					}

					return result;
				}
			});
		}
	};
};
