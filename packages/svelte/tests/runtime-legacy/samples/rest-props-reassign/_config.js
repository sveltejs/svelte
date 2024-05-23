import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>increment</button>
		<p>0 c</p>
		<button>update</button>
	`,

	test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		btn1.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>increment</button>
			<p>1 c</p>
			<button>update</button>
		`
		);

		btn2.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>increment</button>
			<p>1 b c</p>
			<button>update</button>
		`
		);
	}
});
