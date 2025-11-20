/** @import { HydratableLookupEntry } from '#server' */
/** @import { MaybePromise } from '#shared' */
import { async_mode_flag } from '../flags/index.js';
import { get_render_context } from './render-context.js';
import * as e from './errors.js';
import * as devalue from 'devalue';
import { get_stack } from './dev.js';
import { DEV } from 'esm-env';

/**
 * @template T
 * @param {string} key
 * @param {() => T} fn
 * @returns {T}
 */
export function hydratable(key, fn) {
	if (!async_mode_flag) {
		e.experimental_async_required('hydratable');
	}

	const { hydratable } = get_render_context();

	let entry = hydratable.lookup.get(key);

	if (entry !== undefined) {
		if (DEV) {
			compare(key, entry, encode(key, fn(), []));
		}

		return /** @type {T} */ (entry.value);
	}

	const value = fn();

	entry = encode(key, value, hydratable.values, hydratable.unresolved_promises);
	hydratable.lookup.set(key, entry);

	return value;
}

/**
 * @param {string} key
 * @param {any} value
 * @param {MaybePromise<string>[]} values
 * @param {Map<Promise<any>, string>} [unresolved]
 */
function encode(key, value, values, unresolved) {
	/** @type {HydratableLookupEntry} */
	const entry = { value, index: -1 };

	if (DEV) {
		entry.stack = get_stack(`hydratable"`)?.stack;
	}

	let serialized = devalue.uneval(entry.value, (value, uneval) => {
		if (value instanceof Promise) {
			const serialize_promise = value.then((v) => `r(${uneval(v)})`);
			unresolved?.set(serialize_promise, key);
			serialize_promise.finally(() => unresolved?.delete(serialize_promise));

			const index = values.push(serialize_promise) - 1;

			// in dev, we serialize promises as `d("1")` instead of `d(1)`, because it's
			// impossible for that string to occur 'naturally' (since the quote marks
			// would have to be escaped). this allows us to check that repeat occurrences
			// of a given hydratable are identical with a simple string comparison
			const result = DEV ? `d("${index}")` : `d(${index})`;

			if (DEV) {
				(entry.promises ??= []).push(
					serialize_promise.then((s) => {
						serialized = serialized.replace(result, s);
						entry.serialized = serialized;
					})
				);
			}

			return result;
		}
	});

	entry.index = values.push(serialized) - 1;

	return entry;
}

/**
 * @param {string} key
 * @param {HydratableLookupEntry} a
 * @param {HydratableLookupEntry} b
 */
async function compare(key, a, b) {
	for (const p of a.promises ?? []) {
		await p;
	}

	for (const p of b.promises ?? []) {
		await p;
	}

	if (a.serialized !== b.serialized) {
		// TODO right now this causes an unhandled rejection — it
		// needs to happen somewhere else
		e.hydratable_clobbering(
			key,
			a.stack ?? '<missing stack trace>',
			b.stack ?? '<missing stack trace>'
		);
	}
}
