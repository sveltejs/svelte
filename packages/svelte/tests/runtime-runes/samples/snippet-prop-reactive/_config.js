import { test } from '../../test';

export default test({
	html: `
		<p>foo</p>
		<button>show bar</button>
	`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');
		await btn?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<p>bar</p>
				<button>show bar</button>
			`
		);
	}
});
