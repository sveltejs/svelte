import { flushSync, settled, tick } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<button>resolve a</button>
		<button>resolve b</button>
		<button>reset</button>
		<button>increment</button>
		<p>pending</p>
	`,

	async test({ assert, target, logs }) {
		const [resolve_a, resolve_b, reset, increment] = target.querySelectorAll('button');

		flushSync(() => resolve_a.click());
		await tick();

		const p = target.querySelector('p');
		ok(p);
		assert.htmlEqual(p.innerHTML, '1a');

		flushSync(() => increment.click());
		await tick();
		assert.htmlEqual(p.innerHTML, '2a');

		reset.click();
		assert.htmlEqual(p.innerHTML, '2a');

		resolve_b.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '2b');

		assert.deepEqual(logs, [
			'outside boundary 1',
			'$effect.pre 1a 1',
			'template 1a 1',
			'$effect 1a 1',
			'$effect.pre 2a 2',
			'template 2a 2',
			'outside boundary 2',
			'$effect 2a 2',
			'$effect.pre 2b 2',
			'template 2b 2',
			'$effect 2b 2'
		]);
	}
});
