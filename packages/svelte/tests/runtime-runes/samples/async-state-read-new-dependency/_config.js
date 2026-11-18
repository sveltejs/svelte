import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [update, show, resolve] = target.querySelectorAll('button');

		update.click();
		await tick();

		show.click();
		await tick();

		// the template effect newly depends on `value`, which the pending batch
		// has written — it reads the pre-write value and crashes
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>update</button>
				<button>show</button>
				<button>resolve</button>
				<p>crash</p>
			`
		);

		resolve.click();
	}
});
