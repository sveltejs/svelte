import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>reset</button>
		<button>hello</button>
		<button>again</button>
		<p>pending</p>
	`,

	async test({ assert, target }) {
		const [reset, hello, again] = target.querySelectorAll('button');

		hello.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>hello</button>
				<button>again</button>
				<h1>hello</h1>
			`
		);

		reset.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>hello</button>
				<button>again</button>
				<h1>hello</h1>
			`
		);

		again.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>hello</button>
				<button>again</button>
				<h1>hello again</h1>
			`
		);
	}
});
