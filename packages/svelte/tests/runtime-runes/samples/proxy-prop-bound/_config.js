import { test } from '../../test';

export default test({
	html: `
		<button>clicks: 0</button>
		<p>object.count: 0</p>
	`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');
		await btn?.click();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>clicks: 1</button>
				<p>object.count: 1</p>
			`
		);
	}
});
