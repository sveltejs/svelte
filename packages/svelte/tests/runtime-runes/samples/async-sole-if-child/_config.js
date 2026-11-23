import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [toggle] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>toggle</button>
				<header>header</header>
				<footer>footer</footer>
			`
		);

		toggle.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>toggle</button>
			`
		);

		toggle.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>toggle</button>
				<header>header</header>
				<footer>footer</footer>
			`
		);
	}
});
