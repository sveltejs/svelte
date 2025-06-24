import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>resolve 1</button>
		<button>resolve 2</button>
		<hr>
		<p>pending</p>
	`,

	async test({ assert, target }) {
		const [button1, button2] = target.querySelectorAll('button');

		button1.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>resolve 1</button>
				<button>resolve 2</button>
				<hr>
				<p>pending</p>
			`
		);

		button2.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>resolve 1</button>
				<button>resolve 2</button>
				<hr>
				<button>0</button>
				<p>true</p>
			`
		);
	}
});
