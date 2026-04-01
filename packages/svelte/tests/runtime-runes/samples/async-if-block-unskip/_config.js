import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [load, resolve] = target.querySelectorAll('button');

		load.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>load</button>
			<button>resolve</button>
		`
		);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			search search search
			<button>load</button>
			<button>resolve</button>
		`
		);
	}
});
