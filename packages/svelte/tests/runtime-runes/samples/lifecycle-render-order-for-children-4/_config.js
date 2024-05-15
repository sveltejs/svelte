import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	get props() {
		return { n: 0 };
	},

	async test({ assert, component, logs }) {
		assert.deepEqual(logs, [
			'parent: $effect.pre 0',
			'parent: nested $effect.pre 0',
			'parent: render 0',
			'1: $effect.pre 0',
			'1: nested $effect.pre 0',
			'1: render 0',
			'2: $effect.pre 0',
			'2: nested $effect.pre 0',
			'2: render 0',
			'3: $effect.pre 0',
			'3: nested $effect.pre 0',
			'3: render 0',
			'1: $effect 0',
			'2: $effect 0',
			'3: $effect 0',
			'parent: $effect 0'
		]);

		logs.length = 0;

		flushSync(() => (component.n += 1));

		assert.deepEqual(logs, [
			'parent: $effect.pre 1',
			'parent: nested $effect.pre 1',
			'parent: render 1',
			'1: $effect.pre 1',
			'1: nested $effect.pre 1',
			'1: render 1',
			'2: $effect.pre 1',
			'2: nested $effect.pre 1',
			'2: render 1',
			'3: $effect.pre 1',
			'3: nested $effect.pre 1',
			'3: render 1',
			'1: $effect 1',
			'2: $effect 1',
			'3: $effect 1',
			'parent: $effect 1'
		]);
	}
});
