import { test } from '../../test';
import { tick } from 'svelte';

export default test({
	html: `<button>reassign</button><button>mutate</button><div>0</div>`,

	async test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		btn1.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>reassign</button><button>mutate</button><div>1</div>`
		);

		btn2.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>reassign</button><button>mutate</button><div>2</div>`
		);
	}
});
