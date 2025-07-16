import { test } from '../../assert';

export default test({
	mode: ['client'],
	async test({ assert, window }) {
		await new Promise((r) => setTimeout(r, 1000));
		assert.htmlEqual(
			window.document.body.innerHTML,
			`<main><strong>Hello</strong></main>`
		);
	}
});
