import { test } from '../../test';

export default test({
	html: `
		<p>clicks: 0</p>
		<button>click me</button>
	`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		await btn?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<p>clicks: 1</p>
				<button>click me</button>
			`
		);
	}
});
