import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	test({ assert, target }) {
		const button = target.querySelector('button');
		ok(button);
		assert.throws(() => {
			button.click();
			flushSync();
		}, /state_unsafe_mutation/);
		assert.htmlEqual(
			target.innerHTML,
			`<button>click me if u dare</button> <p>this should be rendered</p>`
		);
	}
});
