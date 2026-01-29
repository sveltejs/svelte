import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const shift = document.querySelector('button');
		shift?.click();
		await tick();
		shift?.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>true</p>
			<button>toggle</button>
			<button>shift</button>
		`
		);

		const toggle = target.querySelector('button');
		toggle?.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>true</p>
			<button>toggle</button>
			<button>shift</button>
		`
		);

		shift?.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>true</p>
			<button>toggle</button>
			<button>shift</button>
		`
		);

		shift?.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>toggle</button>
			<button>shift</button>
		`
		);
	}
});
