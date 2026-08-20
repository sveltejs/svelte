/** @import { HydratableLookupEntry } from '#server' */
import { async_mode_flag } from '../flags/index.js';
import { get_render_context } from './render-context.js';
import * as e from './errors.js';
import * as devalue from 'devalue';
import { DEV } from 'esm-env';
import { get_user_code_location } from './dev.js';
import { is_promise } from '../shared/utils.js';

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
			const comparison = compare(key, entry, encode(fn()));
			comparison.catch(() => {});
			hydratable.comparisons.push(comparison);
		}

		return /** @type {T} */ (entry.value);
	}

	const value = fn();

	entry = encode(value);
	hydratable.lookup.set(key, entry);

	return value;
}

/**
 * @param {any} value
 */
function encode(value) {
	/** @type {HydratableLookupEntry} */
	const entry = { value };

	if (DEV) {
		entry.stack = get_user_code_location();
	}

	return entry;
}

/**
 * This function runs in development to ensure that if `hydratable` is called
 * twice with the same key, both occurrences use the same value
 * @param {string} key
 * @param {HydratableLookupEntry} a
 * @param {HydratableLookupEntry} b
 */
async function compare(key, a, b) {
	/**
	 * A simplified version of the logic in `renderer.js`
	 * @param {any} value
	 */
	async function serialize(value) {
		/** @type {Promise<any>[]} */
		const promises = [];

		let uid = 1;

		let serialized = devalue.uneval(value, (value, uneval) => {
			if (is_promise(value)) {
				const placeholder = `"${uid++}"`;
				const p = value.then((v) => {
					serialized = serialized.replace(placeholder, () => uneval(v));
				});

				promises.push(p);
				return placeholder;
			}
		});

		// a loop, not Promise.all, as it may change while we're awaiting
		for (const p of promises) await p;

		return serialized;
	}

	try {
		if ((await serialize(a.value)) === (await serialize(b.value))) {
			return;
		}
	} catch {
		// disregard any errors that happen during serialization,
		// they will be dealt with separately
		return;
	}

	const a_stack = /** @type {string} */ (a.stack);
	const b_stack = /** @type {string} */ (b.stack);

	const stack =
		a_stack === b_stack
			? `Occurred at:\n${a_stack}`
			: `First occurrence at:\n${a_stack}\n\nSecond occurrence at:\n${b_stack}`;

	e.hydratable_clobbering(key, stack);
}

/**
 * @param {string | undefined} root_stack
 * @param {string | undefined} uneval_stack
 */
export function serialization_stack(root_stack, uneval_stack) {
	let out = '';
	if (root_stack) {
		out += root_stack + '\n';
	}
	if (uneval_stack) {
		out += 'Caused by:\n' + uneval_stack + '\n';
	}
	return out || '<missing stack trace>';
}
