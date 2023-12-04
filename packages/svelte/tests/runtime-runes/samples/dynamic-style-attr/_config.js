import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: `<div style="background-color: red">Hello world</div><button>Make blue</button`,

	async test({ assert, target, component }) {
		const [b1] = target.querySelectorAll('button');
		flushSync(() => {
			b1.click();
		});
		assert.htmlEqual(
			target.innerHTML,
			`<div style="background-color: blue">Hello world</div><button>Make blue</button`
		);
	}
});
