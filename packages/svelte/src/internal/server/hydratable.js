/** @import { HydratableLookupEntry } from '#server' */
import { async_mode_flag } from '../flags/index.js';
import { get_render_context } from './render-context.js';
import * as e from './errors.js';
import * as devalue from 'devalue';
import { get_stack } from '../shared/dev.js';
import { DEV } from 'esm-env';
import { get_user_code_location } from './dev.js';

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
			const comparison = compare(key, entry, encode(key, fn()));
			comparison.catch(() => {});
			hydratable.comparisons.push(comparison);
		}

		return /** @type {T} */ (entry.value);
	}

	const value = fn();

	entry = encode(key, value, hydratable.unresolved_promises);
	hydratable.lookup.set(key, entry);

	return value;
}

/**
 * @param {string} key
 * @param {any} value
 * @param {Map<Promise<any>, string>} [unresolved]
 */
function encode(key, value, unresolved) {
	/** @type {HydratableLookupEntry} */
	const entry = { value, serialized: '' };

	if (DEV) {
		entry.stack = get_user_code_location();
	}

	let uid = 1;

	entry.serialized = devalue.uneval(entry.value, (value, uneval) => {
		if (is_promise(value)) {
			// we serialize promises as `"${i}"`, because it's impossible for that string
			// to occur 'naturally' (since the quote marks would have to be escaped)
			// this placeholder is returned synchronously from `uneval`, which includes it in the
			// serialized string. Later (at least one microtask from now), when `p.then` runs, it'll
			// be replaced.
			const placeholder = `"${uid++}"`;
			const p = value
				.then((v) => {
					entry.serialized = entry.serialized.replace(placeholder, `r(${uneval(v)})`);
				})
				.catch((devalue_error) =>
					e.hydratable_serialization_failed(
						key,
						serialization_stack(entry.stack, devalue_error?.stack)
					)
				);

			unresolved?.set(p, key);
			// prevent unhandled rejections from crashing the server, track which promises are still resolving when render is complete
			p.catch(() => {}).finally(() => unresolved?.delete(p));

			(entry.promises ??= []).push(p);
			return placeholder;
		}
	});

	return entry;
}

/**
 * @param {any} value
 * @returns {value is Promise<any>}
 */
function is_promise(value) {
	// we use this check rather than `instanceof Promise`
	// because it works cross-realm
	return Object.prototype.toString.call(value) === '[object Promise]';
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
	for (const p of a?.promises ?? []) {
		await p;
	}

	for (const p of b?.promises ?? []) {
		await p;
	}

	if (a.serialized !== b.serialized) {
		const a_stack = /** @type {string} */ (a.stack);
		const b_stack = /** @type {string} */ (b.stack);

		const stack =
			a_stack === b_stack
				? `Occurred at:\n${a_stack}`
				: `First occurrence at:\n${a_stack}\n\nSecond occurrence at:\n${b_stack}`;

		e.hydratable_clobbering(key, stack);
	}
}

/**
 * @param {string | undefined} root_stack
 * @param {string | undefined} uneval_stack
 */
function serialization_stack(root_stack, uneval_stack) {
	let out = '';
	if (root_stack) {
		out += root_stack + '\n';
	}
	if (uneval_stack) {
		out += 'Caused by:\n' + uneval_stack + '\n';
	}
	return out || '<missing stack trace>';
}
