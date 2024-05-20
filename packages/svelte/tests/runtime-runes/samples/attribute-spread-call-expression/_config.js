import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button class="red">red</button>
		<button class="red">red</button>
		<button class="red">red</button>
		<button class="red">red</button>
	`,

	test({ assert, target }) {
		const [b1, b2, b3, b4] = target.querySelectorAll('button');

		flushSync(() => {
			b1?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button class="blue">blue</button>
				<button class="red">red</button>
				<button class="red">red</button>
				<button class="red">red</button>
			`
		);

		flushSync(() => {
			b2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button class="blue">blue</button>
				<button class="blue">blue</button>
				<button class="red">red</button>
				<button class="red">red</button>
			`
		);

		flushSync(() => {
			b3?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button class="blue">blue</button>
				<button class="blue">blue</button>
				<button class="blue">blue</button>
				<button class="red">red</button>
			`
		);

		flushSync(() => {
			b4?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button class="blue">blue</button>
				<button class="blue">blue</button>
				<button class="blue">blue</button>
				<button class="blue">blue</button>
			`
		);
	}
});
