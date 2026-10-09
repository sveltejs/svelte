import { async_mode_flag } from '../flags/index.js';
import { get_render_context } from './render-context.js';
import { Warp, get_stack, is_promise } from './warp.js';
import * as e from './errors.js';
import * as devalue from 'devalue';
import { DEV } from 'esm-env';
import { get_user_code_location } from './dev.js';

export const HYDRATABLE_ID = 'svelte:hydratable';

/** @type {Warp<string, any>} */
const warp = new Warp(HYDRATABLE_ID);

/**
 * @deprecated Use [`Warp`](https://svelte.dev/docs/svelte/warp) instead
 * @template T
 * @param {string} key
 * @param {() => T} fn
 * @returns {T}
 */
export function hydratable(key, fn) {
	if (!async_mode_flag) {
		e.experimental_async_required('hydratable');
	}

	if (warp.has(key)) {
		const value = warp.get(key);

		if (DEV) {
			const store = get_render_context().warp;
			const comparison = compare(key, value, fn(), get_stack(store, HYDRATABLE_ID, key));
			comparison.catch(() => {});
			store.comparisons.push(comparison);
		}

		return value;
	}

	const value = fn();
	warp.set(key, value);
	return value;
}

/**
 * Serializes a value, waiting for any promises inside it to resolve
 * @param {unknown} value
 * @returns {Promise<string>}
 */
async function serialize(value) {
	/** @type {Map<Promise<unknown>, unknown>} */
	const resolved = new Map();
	/** @type {unknown[]} */
	const pending = [value];

	while (pending.length > 0) {
		/** @type {Promise<unknown>[]} */
		const promises = [];

		devalue.uneval(pending.splice(0), (thing, js) => {
			if (is_promise(thing)) {
				if (!resolved.has(thing)) promises.push(thing);
				return js`0`;
			}
		});

		for (const promise of promises) {
			const v = await promise;
			resolved.set(promise, v);
			pending.push(v);
		}
	}

	return devalue.uneval(value, (thing, js) => {
		if (is_promise(thing)) return js`r(${resolved.get(thing)})`;
	});
}

/**
 * @param {string} key
 * @param {unknown} a
 * @param {unknown} b
 * @param {string} a_stack
 */
async function compare(key, a, b, a_stack) {
	const b_stack = get_user_code_location();

	let a_serialized;
	let b_serialized;

	try {
		a_serialized = await serialize(a);
		b_serialized = await serialize(b);
	} catch {
		// serialization errors are surfaced separately, when the value is serialized for real
		return;
	}

	if (a_serialized !== b_serialized) {
		const stack =
			a_stack === b_stack
				? `Occurred at:\n${a_stack}`
				: `First occurrence at:\n${a_stack}\n\nSecond occurrence at:\n${b_stack}`;

		e.hydratable_clobbering(key, stack);
	}
}
