import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>0</button><p>9</p>`,
	async test({ assert, target }) {
		const [button] = target.querySelectorAll('button');

		button.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>1</button><p>9</p>`);
	}
});
