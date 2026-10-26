import { test } from '../../test';
import { tick } from 'svelte';

export default test({
	html: `<button>add y</button><button>delete y</button><p>false</p>`,

	async test({ assert, target }) {
		const [add, remove] = target.querySelectorAll('button');

		add.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>add y</button><button>delete y</button><p>true</p>`
		);

		remove.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>add y</button><button>delete y</button><p>false</p>`
		);
	}
});
