import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>3</button>`,
	async test({ assert, target }) {
		target.querySelector('button')?.click();
		await tick();

		assert.htmlEqual(target.innerHTML, `<button>1</button>`);
	}
});
