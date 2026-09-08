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
		// has written — it reads the latest value rather than the pre-write one
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>update</button>
				<button>show</button>
				<button>resolve</button>
				<p>1</p>
			`
		);

		resolve.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>update</button>
				<button>show</button>
				<button>resolve</button>
				<p>1</p>
			`
		);
	}
});
