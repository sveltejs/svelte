import { flushSync, tick } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<button>cool</button>
		<button>neat</button>
		<button>reset</button>
		<p>pending</p>
	`,

	async test({ assert, target, component }) {
		const [cool, neat, reset] = target.querySelectorAll('button');

		flushSync(() => cool.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		flushSync();

		const p = target.querySelector('p');
		ok(p);
		assert.htmlEqual(p.outerHTML, '<p class="cool">hello</p>');

		flushSync(() => reset.click());
		assert.htmlEqual(p.outerHTML, '<p class="cool">hello</p>');

		flushSync(() => neat.click());
		await tick();
		assert.htmlEqual(p.outerHTML, '<p class="neat">hello</p>');
	}
});
