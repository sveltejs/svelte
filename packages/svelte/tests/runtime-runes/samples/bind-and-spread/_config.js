import { test } from '../../test';

export default test({
	html: `<button class="foo">0</button><button class="foo">0</button>`,

	async test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		await btn1?.click();
		assert.htmlEqual(
			target.innerHTML,
			`<button class="foo">1</button><button class="foo">1</button>`
		);

		await btn2?.click();
		assert.htmlEqual(
			target.innerHTML,
			`<button class="foo">2</button><button class="foo">2</button>`
		);
	}
});
