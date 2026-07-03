import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [toggle, resolve] = target.querySelectorAll('button');

		toggle.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>toggle</button> <button>resolve</button> a`);

		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>toggle</button> <button>resolve</button> b b`);
	}
});
