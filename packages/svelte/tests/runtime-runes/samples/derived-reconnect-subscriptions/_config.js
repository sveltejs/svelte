import { test } from '../../test';
import { flushSync } from '../../../../src/internal/client/reactivity/batch.js';
import { derived } from '../../../../src/internal/client/reactivity/deriveds.js';
import { effect_root, render_effect } from '../../../../src/internal/client/reactivity/effects.js';
import { source, set } from '../../../../src/internal/client/reactivity/sources.js';
import { get, untrack } from '../../../../src/internal/client/runtime.js';

export default test({
	test({ assert }) {
		const enabled = source(false);
		const shared = source(1);
		/** @type {import('../../../../src/internal/client/types.js').Derived<number>} */
		let value;

		const destroy_owner = effect_root(() => {
			value = derived(() => (get(enabled) ? get(shared) : 0));
			untrack(() => get(value));
		});

		flushSync(() => set(enabled, true));
		const destroy_reader = effect_root(() => {
			render_effect(() => {
				get(value);
			});
		});

		const enabled_subscriptions = enabled.reactions?.length;
		const shared_subscriptions = shared.reactions?.length;
		const enabled_reaction = enabled.reactions?.[0];
		const shared_reaction = shared.reactions?.[0];

		destroy_reader();
		destroy_owner();

		assert.equal(enabled_subscriptions, 1);
		assert.equal(shared_subscriptions, 1);
		assert.equal(enabled_reaction, shared_reaction);
		assert.equal(enabled.reactions, null);
		assert.equal(shared.reactions, null);

		const nested_enabled = source(false);
		const nested_shared = source(1);
		/** @type {import('../../../../src/internal/client/types.js').Derived<number>} */
		let inner;
		/** @type {import('../../../../src/internal/client/types.js').Derived<number>} */
		let outer;

		const destroy_nested_owner = effect_root(() => {
			inner = derived(() => (get(nested_enabled) ? get(nested_shared) : 0));
			outer = derived(() => get(inner));
			untrack(() => get(outer));
		});

		flushSync(() => set(nested_enabled, true));
		const destroy_nested_reader = effect_root(() => {
			render_effect(() => {
				get(outer);
			});
		});

		const nested_enabled_subscriptions = nested_enabled.reactions?.length;
		const nested_shared_subscriptions = nested_shared.reactions?.length;
		const nested_enabled_reaction =
			/** @type {import('../../../../src/internal/client/types.js').Derived<number> | undefined} */ (
				nested_enabled.reactions?.[0]
			);
		const nested_shared_reaction = nested_shared.reactions?.[0];
		const inner_subscriptions = nested_enabled_reaction?.reactions?.length;

		destroy_nested_reader();
		destroy_nested_owner();

		assert.equal(nested_enabled_subscriptions, 1);
		assert.equal(nested_shared_subscriptions, 1);
		assert.equal(inner_subscriptions, 1);
		assert.equal(nested_enabled_reaction, nested_shared_reaction);
		assert.equal(nested_enabled.reactions, null);
		assert.equal(nested_shared.reactions, null);
		assert.equal(nested_enabled_reaction?.reactions, null);
	}
});
