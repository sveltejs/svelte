import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>+1</button>
		<button>add number</button>
		<p>1, 2, 3</p>
	`,

	test({ assert, target }) {
		const [button1, button2] = target.querySelectorAll('button');

		button1.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>+1</button>
				<button>add number</button>
				<p>2, 4, 6</p>
			`
		);

		button2.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>+1</button>
				<button>add number</button>
				<p>2, 4, 6, 8</p>
			`
		);

		button1.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>+1</button>
				<button>add number</button>
				<p>3, 6, 9, 12</p>
			`
		);
	}
});
