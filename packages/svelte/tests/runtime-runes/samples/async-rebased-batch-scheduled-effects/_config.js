import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [a, b, c, resolve] = target.querySelectorAll('button');
		assert.deepEqual(logs, ['effect 0']);

		a.click();
		await tick();
		b.click();
		await tick();
		c.click();
		await tick();
		assert.deepEqual(logs, ['effect 0']);

		resolve.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			'<button>a</button><button>b</button><button>c</button><button>resolve</button><p>item 1</p><p>c 1</p><p>slow 1</p>'
		);
		assert.deepEqual(logs, ['effect 0', 'effect 1']);
	}
});
