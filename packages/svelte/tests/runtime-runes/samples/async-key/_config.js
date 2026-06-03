import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>reset</button>
		<button>1</button>
		<button>2</button>
		<p>pending</p>
	`,

	async test({ assert, target }) {
		const [reset, one, two] = target.querySelectorAll('button');

		const html = `
			<button>reset</button>
			<button>1</button>
			<button>2</button>
			<h1>hello</h1>
		`;

		one.click();
		await tick();
		assert.htmlEqual(target.innerHTML, html);

		const h1 = target.querySelector('h1');

		reset.click();
		await tick();
		assert.htmlEqual(target.innerHTML, html);

		one.click();
		await tick();
		assert.htmlEqual(target.innerHTML, html);
		assert.equal(target.querySelector('h1'), h1);

		reset.click();
		await tick();
		assert.htmlEqual(target.innerHTML, html);

		two.click();
		await tick();
		assert.htmlEqual(target.innerHTML, html);
		assert.notEqual(target.querySelector('h1'), h1);
	}
});
