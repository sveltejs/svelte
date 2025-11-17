/** @import { Encode, Transport } from '#shared' */
/** @import { HydratableEntry } from '#server' */
import { async_mode_flag } from '../flags/index.js';
import { get_render_context } from './render-context.js';
import * as e from './errors.js';
import { DEV } from 'esm-env';

/**
 * @template T
 * @param {string} key
 * @param {() => T} fn
 * @param {Transport<T>} [transport]
 * @returns {T}
 */
export function hydratable(key, fn, transport) {
	if (!async_mode_flag) {
		e.experimental_async_required('hydratable');
	}

	const store = get_render_context();

	if (store.hydratables.has(key)) {
		e.hydratable_clobbering(key, store.hydratables.get(key)?.stack || 'unknown');
	}

	const entry = create_entry(fn(), transport?.encode);
	store.hydratables.set(key, entry);
	return entry.value;
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
