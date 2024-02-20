import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>toggle</button><div></div>`,
	async test({ assert, target }) {
		const button = target.querySelector('button');

		await button?.click();
		assert.htmlEqual(target.innerHTML, `<button>toggle</button><div><button>0</button></div>`);

		const inner_button = target.querySelector('div')?.querySelector('button');

		inner_button?.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>toggle</button><div><button>2</button></div>`);

		await button?.click();
		assert.htmlEqual(target.innerHTML, `<button>toggle</button><div></div>`);
	}
});
