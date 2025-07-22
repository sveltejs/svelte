import { tick } from 'svelte';
import { test, ok } from '../../test';

// Tests that tick only resolves after all pending effects have been cleared
export default test({
	skip: true, // weirdly, this works if you run it by itself

	async test({ assert, target }) {
		const btn = target.querySelector('button');
		ok(btn);
		btn.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>5</button>`);
		btn.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>6</button>`);
	}
});
