import { test } from '../../test';

export default test({
	html: `
	<button>multiplier: 1</button>
	<button>result: 0</button>
	`,

	async test({ assert, target, window }) {
		const [b1, b2] = target.querySelectorAll('button');

		b1.click();
		b2.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`
		<button>multiplier: 2</button>
		<button>result: 2</button>
		`
		);

		b1.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`
		<button>multiplier: 3</button>
		<button>result: 2</button>
		`
		);

		b2.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`
		<button>multiplier: 3</button>
		<button>result: 6</button>
		`
		);
	}
});
