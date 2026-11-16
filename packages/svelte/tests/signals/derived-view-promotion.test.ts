import { assert, it } from 'vitest';
import { flushSync, fork } from '../../src/index-client';
import { enable_async_mode_flag, disable_async_mode_flag } from '../../src/internal/flags';
import { push, pop } from '../../src/internal/client/context';
import { Batch, clear, current_batch } from '../../src/internal/client/reactivity/batch';
import {
	async_effect,
	branch,
	effect,
	effect_root
} from '../../src/internal/client/reactivity/effects';
import { derived } from '../../src/internal/client/reactivity/deriveds';
import { internal_set, set, source } from '../../src/internal/client/reactivity/sources';
import { get } from '../../src/internal/client/runtime';
import { ASYNC } from '../../src/internal/client/constants';
import type { Effect } from '../../src/internal/client/types';

for (const equal_global of [false, true]) {
	it(`preserves a private projection version when its view becomes real (equal global: ${equal_global})`, async () => {
		enable_async_mode_flag();
		const selection = source({ value: 0, progress: 0 });
		selection.f |= ASYNC;
		const unrelated = source(0);
		const calls: number[] = [];
		const visible: number[] = [];
		let producer!: Effect;
		let selected!: Batch;
		let destroy = () => {};
		let other: ReturnType<typeof fork> | undefined;
		let speculative: ReturnType<typeof fork> | undefined;

		push({}, true);
		try {
			flushSync(() => {
				Batch.ensure();
				destroy = effect_root(() => {
					branch(() => {
						const projection = derived(() => Math.min(1, get(selection).value));
						producer = async_effect(() => {
							calls.push(get(projection));
						});
						effect(() => {
							visible.push(get(projection));
						});
					});
				});
			});
		} finally {
			pop();
		}

		try {
			speculative = fork(() => {
				selected = current_batch!;
				set(selection, { value: 1, progress: 0 });
			});
			if (equal_global) {
				// Both views independently reached the same projection value. Its
				// existing global version can differ from the private one's version.
				flushSync(() => set(selection, { value: 2, progress: 0 }));
			}
			const expected = equal_global ? [0, 1, 1] : [0, 1];
			assert.deepEqual(visible, equal_global ? [0, 1] : [0], 'the real view is already visible');
			other = fork(() => set(unrelated, 1));
			selected.increment(producer);
			const committed = speculative.commit();
			assert.deepEqual(calls, expected);

			// The unrelated view kept the projection private during commit(). Once it
			// disappears, a new dependency version forces a global evaluation instead.
			other.discard();
			selected.activate();
			internal_set(selection, { value: 1, progress: 1 });
			selected.deactivate();
			selected.flush();
			assert.deepEqual(calls, expected, 'equal projection must retain its private result version');

			selected.decrement(producer);
			flushSync();
			await committed;
			assert.deepEqual(
				visible,
				[0, 1],
				'equal visible values must not rerun ordinary user effects'
			);
		} finally {
			other?.discard();
			speculative?.discard();
			destroy();
			clear();
			disable_async_mode_flag();
		}
	});
}
