import { test } from '../../test';

export default test({
	html: `
	<button>foo</button>
	<button>foo</button>
	<button>foo</button>
	`,

	async test({ assert, target }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		// ensure each click runs in its own rerender task
		await btn1.click();
		await Promise.resolve();

		await btn2.click();
		await Promise.resolve();

		await btn3.click();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
	<button>bar</button>
	<button>bar</button>
	<button>foo</button>
	`
		);
	}
});
