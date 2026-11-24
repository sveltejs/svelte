import { assert, it } from 'vitest';
import { push, pop } from '../../src/internal/client/context';
import {
	disable_async_mode_flag,
	enable_async_mode_flag,
	enable_legacy_mode_flag
} from '../../src/internal/flags';
import { flushSync } from '../../src/internal/client/reactivity/batch';
import { block, effect, effect_root } from '../../src/internal/client/reactivity/effects';
import { state, set } from '../../src/internal/client/reactivity/sources';
import { get } from '../../src/internal/client/runtime';

enable_legacy_mode_flag();

it.each([
	{ async: false, runes: false },
	{ async: false, runes: true },
	{ async: true, runes: false },
	{ async: true, runes: true }
])(
	'retains writes after a nested effect flush (async: $async, runes: $runes)',
	({ async, runes }) => {
		if (async) enable_async_mode_flag();
		push({}, runes);

		const trigger = state(0);
		const nested_trigger = state(0);
		const nested_value = state(0);
		const earlier = state(0);
		const show = state(true);
		const log: string[] = [];

		// A separate root ensures the nested flush doesn't also traverse the outer siblings.
		const destroy_nested = effect_root(() => {
			effect(() => {
				if (get(nested_trigger) === 1) set(nested_value, 42);
			});
		});

		const destroy = effect_root(() => {
			block(() => {
				get(show);
				return () => log.push(`${get(earlier)}:${get(show)}`);
			});

			effect(() => {
				if (get(trigger) === 1) {
					flushSync(() => set(nested_trigger, 1));
					set(earlier, 1);
					set(earlier, 2);
				}
			});

			effect(() => {
				if (get(trigger) === 1) set(show, false);
			});
		});
		pop();

		try {
			flushSync();
			flushSync(() => set(trigger, 1));
			assert.equal(get(nested_value), 42);
			assert.deepEqual(log, ['2:true']);
		} finally {
			destroy();
			destroy_nested();
			disable_async_mode_flag();
		}
	}
);
