import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip: true, // failing test for https://github.com/sveltejs/svelte/issues/10787
	html: `<button>3</button>`,
	async test({ assert, target }) {
		target.querySelector('button')?.click();
		await tick();

		assert.htmlEqual(target.innerHTML, `<button>1</button>`);
	}
});
