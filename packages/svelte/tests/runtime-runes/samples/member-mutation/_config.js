import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>person.name.first = "dave"</button><h3>JSON output</h3><div>[{"name":{"first":"rob"}}]</div>`,

	async test({ assert, target }) {
		const button = target.querySelector('button');

		flushSync(() => {
			button?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>person.name.first = "dave"</button><h3>JSON output</h3><div>[{"name":{"first":"dave"}}]</div>`
		);
	}
});
