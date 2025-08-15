import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [show, resolve] = target.querySelectorAll('button');

		show.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>show</button>
				<button>resolve</button>
				<p>pending...</p>
			`
		);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>show</button>
				<button>resolve</button>
				<p>pending...</p>
			`
		);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>show</button>
				<button>resolve</button>
				<p>foo: foo</p>
				<p>bar: bar</p>
			`
		);
	}
});
