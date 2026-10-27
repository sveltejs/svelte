import { flushSync } from 'svelte';
import { test } from '../../test';
import { async_mode } from '../../../helpers.js';

export default test({
	get props() {
		return { n: 0 };
	},

	async test({ assert, component, logs }) {
		assert.deepEqual(logs, ['$effect.pre 0', 'another $effect.pre 1', 'render n0', 'render i1']);

		logs.length = 0;
		flushSync(() => (component.n += 1));

		assert.deepEqual(logs, async_mode
			? ['$effect.pre 1', 'render n1', 'render i2', 'another $effect.pre 2']
			: ['$effect.pre 1', 'another $effect.pre 2', 'render n1', 'render i2']
		);
	}
});
