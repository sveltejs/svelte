import { test } from '../../test';
import { tick } from 'svelte';

export default test({
	html: `<button>reassign</button><button>mutate</button><p>0 / 0</p>`,

	async test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		btn1.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>reassign</button><button>mutate</button><p>1 / 1</p>`
		);

		btn2.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>reassign</button><button>mutate</button><p>2 / 2</p>`
		);
	}
});
