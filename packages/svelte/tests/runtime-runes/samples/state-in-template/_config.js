import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<form><input name="name"><button>Add</button></form>`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<form><input name="name"><button>Add</button></form><div></div>`
		);
	}
});
