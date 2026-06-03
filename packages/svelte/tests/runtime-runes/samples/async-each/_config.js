import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>reset</button>
		<button>abc</button>
		<button>defg</button>
		<p>pending</p>
	`,

	async test({ assert, target }) {
		const [reset, abc, defg] = target.querySelectorAll('button');

		abc.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>abc</button>
				<button>defg</button>
				<p>a</p><p>b</p><p>c</p>`
		);

		reset.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>abc</button>
				<button>defg</button>
				<p>a</p><p>b</p><p>c</p>`
		);

		defg.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>abc</button>
				<button>defg</button>
				<p>d</p><p>e</p><p>f</p><p>g</p>`
		);
	}
});
