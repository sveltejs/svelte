import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>reset</button>
		<button>hello</button>
		<button>wheee</button>
		<p>pending</p>
	`,

	async test({ assert, target }) {
		const [reset, hello, wheee] = target.querySelectorAll('button');

		hello.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>hello</button>
				<button>wheee</button>
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
				<button>wheee</button>
				<h1>hello</h1>
			`
		);

		wheee.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>hello</button>
				<button>wheee</button>
				<h1>wheee</h1>
			`
		);
	}
});
