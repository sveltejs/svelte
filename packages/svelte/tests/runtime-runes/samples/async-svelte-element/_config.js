import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>reset</button>
		<button>h1</button>
		<button>h2</button>
		<p>pending</p>
	`,

	async test({ assert, target }) {
		const [reset, h1, h2] = target.querySelectorAll('button');

		h1.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>h1</button>
				<button>h2</button>
				<h1>hello</h1>
			`
		);

		reset.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>h1</button>
				<button>h2</button>
				<h1>hello</h1>
			`
		);

		h2.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>h1</button>
				<button>h2</button>
				<h2>hello</h2>
			`
		);
	}
});
