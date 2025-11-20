/** @import { HydratableLookupEntry } from '#server' */
/** @import { MaybePromise } from '#shared' */
import { async_mode_flag } from '../flags/index.js';
import { get_render_context } from './render-context.js';
import * as e from './errors.js';
import * as devalue from 'devalue';
import { get_stack } from './dev.js';
import { DEV } from 'esm-env';
import { deferred } from '../shared/utils.js';

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
			const comparison = compare(key, entry, encode(key, fn(), []));
			comparison.catch(() => {});
			hydratable.comparisons.push(comparison);
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
		entry.stack = get_stack('hydratable')?.stack;
	}

	let needs_thunk = false;
	let serialized = devalue.uneval(entry.value, (value, uneval) => {
		if (value instanceof Promise) {
			needs_thunk = true;
			/** @param {string} val */
			const scoped_uneval = (val) => {
				const raw = `r(${uneval(val)})`;
				const result = needs_thunk ? `()=>(${raw})` : raw;
				needs_thunk = false;
				return result;
			};
			const serialize_promise = value.then(scoped_uneval);
			unresolved?.set(serialize_promise, key);
			serialize_promise.finally(() => unresolved?.delete(serialize_promise));

			const index = values.push(serialize_promise) - 1;

			// in dev, we serialize promises as `d("1")` instead of `d(1)`, because it's
			// impossible for that string to occur 'naturally' (since the quote marks
			// would have to be escaped). this allows us to check that repeat occurrences
			// of a given hydratable are identical with a simple string comparison
			const result = DEV ? `d("${index}")` : `d(${index})`;

			if (DEV) {
				(entry.serialize_work ??= []).push(
					serialize_promise.then((s) => {
						serialized = serialized.replace(result, s);
						entry.serialized = serialized;
					})
				);
			}

			return result;
		}
	});

	entry.serialized = serialized;
	entry.index = values.push(needs_thunk ? `()=>(${serialized})` : serialized) - 1;
	needs_thunk = false;

	return entry;
}

/**
 * @param {string} key
 * @param {HydratableLookupEntry} a
 * @param {HydratableLookupEntry} b
 */
async function compare(key, a, b) {
	// note: these need to be loops (as opposed to Promise.all) because
	// additional promises can get pushed to them while we're awaiting
	// an earlier one
	for (const p of a?.serialize_work ?? []) {
		await p;
	}

	for (const p of b?.serialize_work ?? []) {
		await p;
	}

	if (a?.serialized !== b?.serialized) {
		e.hydratable_clobbering(
			key,
			a?.stack ?? '<missing stack trace>',
			b?.stack ?? '<missing stack trace>'
		);
	}
}
