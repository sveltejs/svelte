/** @import { Source } from '#client' */
import { derived } from '../internal/client/index.js';
import { set, state } from '../internal/client/reactivity/sources.js';
import { tag } from '../internal/client/dev/tracing.js';
import { active_reaction, get, set_active_reaction } from '../internal/client/runtime.js';
import { DEV } from 'esm-env';

var inited = false;

/**
 * A reactive version of the built-in [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object.
 * Reading the date (whether with methods like `date.getTime()` or `date.toString()`, or via things like [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat))
 * in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
 * will cause it to be re-evaluated when the value of the date changes.
 *
 * ```svelte
 * <script>
 * 	import { SvelteDate } from 'svelte/reactivity';
 *
 * 	const date = new SvelteDate();
 *
 * 	const formatter = new Intl.DateTimeFormat(undefined, {
 * 	  hour: 'numeric',
 * 	  minute: 'numeric',
 * 	  second: 'numeric'
 * 	});
 *
 * 	$effect(() => {
 * 		const interval = setInterval(() => {
 * 			date.setTime(Date.now());
 * 		}, 1000);
 *
 * 		return () => {
 * 			clearInterval(interval);
 * 		};
 * 	});
 * </script>
 *
 * <p>The time is {formatter.format(date)}</p>
 * ```
 */
export class SvelteDate extends Date {
	#time = state(super.getTime());

	/** @type {Map<keyof Date, Source<unknown>>} */
	#deriveds = new Map();

	#reaction = active_reaction;

	/** @param {any[]} params */
	constructor(...params) {
		// @ts-ignore
		super(...params);

		if (DEV) {
			tag(this.#time, 'SvelteDate.#time');
		}

		if (!inited) this.#init();
	}

	#init() {
		inited = true;

		var proto = SvelteDate.prototype;
		var date_proto = Date.prototype;

		var methods = /** @type {Array<keyof Date & string>} */ (
			Object.getOwnPropertyNames(date_proto)
		);

		for (const method of methods) {
			if (method.startsWith('get') || method.startsWith('to') || method === 'valueOf') {
				// @ts-ignore
				proto[method] = function (...args) {
					// don't memoize if there are arguments
					// @ts-ignore
					if (args.length > 0) {
						get(this.#time);
						// @ts-ignore
						return date_proto[method].apply(this, args);
					}

					var d = this.#deriveds.get(method);

					if (d === undefined) {
						// lazily create the derived, but as though it were being
						// created at the same time as the class instance
						const reaction = active_reaction;
						set_active_reaction(this.#reaction);

						d = derived(() => {
							get(this.#time);
							// @ts-ignore
							return date_proto[method].apply(this, args);
						});

						this.#deriveds.set(method, d);

						set_active_reaction(reaction);
					}

					return get(d);
				};
			}

			if (method.startsWith('set')) {
				// @ts-ignore
				proto[method] = function (...args) {
					// @ts-ignore
					var result = date_proto[method].apply(this, args);
					set(this.#time, date_proto.getTime.call(this));
					return result;
				};
			}
		}
	}
}
