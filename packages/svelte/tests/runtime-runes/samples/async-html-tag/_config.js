import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>reset</button>
		<button>hello</button>
		<button>goodbye</button>
		<p>pending</p>
	`,

	async test({ assert, target }) {
		const [reset, hello, goodbye] = target.querySelectorAll('button');

		hello.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>hello</button>
				<button>goodbye</button>
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
				<button>goodbye</button>
				<h1>hello</h1>
			`
		);

		goodbye.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>hello</button>
				<button>goodbye</button>
				<h1>goodbye</h1>
			`
		);
	}
});
