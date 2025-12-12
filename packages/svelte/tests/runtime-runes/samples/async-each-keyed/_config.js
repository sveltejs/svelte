import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	html: `
		<button>reset</button>
		<button>one</button>
		<button>two</button>
		<button>three</button>
		<p>pending</p>
	`,

	async test({ assert, target }) {
		const [reset, one, two, three] = target.querySelectorAll('button');

		one.click();
		await tick();

		const [div] = target.querySelectorAll('div');
		assert.htmlEqual(div.innerHTML, '<p>a</p><p>b</p><p>c</p>');

		reset.click();
		await tick();
		assert.htmlEqual(div.innerHTML, '<p>a</p><p>b</p><p>c</p>');

		two.click();
		await tick();
		assert.htmlEqual(div.innerHTML, '<p>d</p><p>e</p><p>f</p><p>g</p>');

		reset.click();
		await tick();
		three.click();
		await tick();

		assert.include(target.innerHTML, '<p>each_key_duplicate');
	}
});
