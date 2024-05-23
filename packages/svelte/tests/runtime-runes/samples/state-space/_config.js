import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button type="button">Update Text</button><div></div>`,

	test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button type="button">Update Text</button><div>updated</div>`
		);
	}
});
