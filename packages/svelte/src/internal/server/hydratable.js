/** @import { Encode, Hydratable, Transport } from '#shared' */
/** @import { HydratableEntry } from '#server' */
import { async_mode_flag } from '../flags/index.js';
import { get_render_context } from './render-context.js';
import * as e from './errors.js';
import { DEV } from 'esm-env';

/**
 * @template T
 * @param {string} key
 * @param {() => T} fn
 * @param {{ transport?: Transport<T> }} [options]
 * @returns {T}
 */
function isomorphic_hydratable(key, fn, options) {
	if (!async_mode_flag) {
		e.experimental_async_required('hydratable');
	}

	const store = get_render_context();

	if (store.hydratables.has(key)) {
		e.hydratable_clobbering(key, store.hydratables.get(key)?.stack || 'unknown');
	}

	const entry = create_entry(fn(), options?.transport?.encode);
	store.hydratables.set(key, entry);
	return entry.value;
}

isomorphic_hydratable['get'] = () => e.fn_unavailable_on_server('hydratable.get');
isomorphic_hydratable['has'] = has_hydratable_value;
isomorphic_hydratable['set'] = set_hydratable_value;

/** @type {Hydratable} */
const hydratable = isomorphic_hydratable;

export { hydratable };

/**
 * @template T
 * @param {string} key
 * @param {T} value
 * @param {{ encode?: Encode<T> }} [options]
 */
function set_hydratable_value(key, value, options = {}) {
	if (!async_mode_flag) {
		e.experimental_async_required('hydratable.set');
	}

	const store = get_render_context();

	if (store.hydratables.has(key)) {
		e.hydratable_clobbering(key, store.hydratables.get(key)?.stack || 'unknown');
	}

	store.hydratables.set(key, create_entry(value, options?.encode));
}

/**
 * @param {string} key
 * @returns {boolean}
 */
function has_hydratable_value(key) {
	if (!async_mode_flag) {
		e.experimental_async_required('hydratable.has');
	}
	const store = get_render_context();
	return store.hydratables.has(key);
}

/**
 * @template T
 * @param {T} value
 * @param {Encode<T> | undefined} encode
 */
function create_entry(value, encode) {
	/** @type {Omit<HydratableEntry, 'value'> & { value: T }} */
	const entry = {
		value,
		encode
	};

	if (DEV) {
		entry.stack = new Error().stack;
	}

	return entry;
}
