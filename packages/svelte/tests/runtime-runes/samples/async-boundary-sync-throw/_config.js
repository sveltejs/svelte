import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>invalidate</button><p>ready</p>`);

		target.querySelector('button').click();
		await tick();

		assert.htmlEqual(target.innerHTML, `<button>invalidate</button><p>original error</p>`);
	}
});
