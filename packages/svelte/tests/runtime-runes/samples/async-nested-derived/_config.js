import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>0</button><p>0</p>');

		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, '<button>1</button><p>1</p>');
	}
});
