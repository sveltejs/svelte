import { tick } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<button>cool</button>
		<button>neat</button>
		<button>reset</button>
		<p>pending</p>
	`,

	async test({ assert, target }) {
		const [cool, neat, reset] = target.querySelectorAll('button');

		cool.click();
		await tick();

		const p = target.querySelector('p');
		ok(p);
		assert.htmlEqual(p.outerHTML, '<p class="cool">hello</p>');

		reset.click();
		assert.htmlEqual(p.outerHTML, '<p class="cool">hello</p>');

		neat.click();
		await tick();
		assert.htmlEqual(p.outerHTML, '<p class="neat">hello</p>');
	}
});
