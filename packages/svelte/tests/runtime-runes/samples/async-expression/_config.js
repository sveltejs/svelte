import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>reset</button>
		<button>hello</button>
		<button>goodbye</button>
		<p>pending</p>
	`,

	async test({ assert, target, raf }) {
		const [reset, hello, goodbye] = target.querySelectorAll('button');

		hello.click();
		raf.tick(0);
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
		raf.tick(0);
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>hello</button>
				<button>goodbye</button>
				<h1>hello</h1>
				<p>updating...</p>
			`
		);

		goodbye.click();
		await Promise.resolve();
		raf.tick(0);
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
