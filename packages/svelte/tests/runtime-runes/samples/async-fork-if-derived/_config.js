import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [, toggle] = target.querySelectorAll('button');

		toggle?.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>0</button> <button>toggle</button> 0`);

		toggle?.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>0</button> <button>toggle</button>`);

		toggle?.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>0</button> <button>toggle</button> 0`);
	}
});
