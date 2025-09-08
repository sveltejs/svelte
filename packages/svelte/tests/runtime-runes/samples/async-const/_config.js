import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<h1>Loading...</h1>`,

	async test({ assert, target }) {
		await tick();

		assert.htmlEqual(target.innerHTML, `<h1>Hello, world!</h1> 5 01234`);
	}
});
