import { test } from '../../test';

export default test({
	html: `
		<button class="red">red</button>
		<button class="red">red</button>
		<button class="red">red</button>
		<button class="red">red</button>
	`,

	async test({ assert, target }) {
		const [b1, b2, b3, b4] = target.querySelectorAll('button');

		b1?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button class="blue">blue</button>
				<button class="red">red</button>
				<button class="red">red</button>
				<button class="red">red</button>
			`
		);

		b2?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button class="blue">blue</button>
				<button class="blue">blue</button>
				<button class="red">red</button>
				<button class="red">red</button>
			`
		);

		b3?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button class="blue">blue</button>
				<button class="blue">blue</button>
				<button class="blue">blue</button>
				<button class="red">red</button>
			`
		);

		b4?.click();
		await Promise.resolve();
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
