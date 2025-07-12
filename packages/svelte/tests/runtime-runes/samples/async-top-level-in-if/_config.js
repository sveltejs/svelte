import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [toggle, hello] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>toggle</button>
			<button>hello</button>
		`
		);

		toggle.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>toggle</button>
			<button>hello</button>
		`
		);

		hello.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>toggle</button>
			<button>hello</button>
			<p>condition is true</p>
			<p>hello</p>
		`
		);
	}
});
