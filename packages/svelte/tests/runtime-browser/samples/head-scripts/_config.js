import { test } from '../../assert';

export default test({
	mode: ['client'],
	async test({ assert, window }) {
		// wait the script to load (maybe there a better way)
		await new Promise((resolve) => setTimeout(resolve, 1));
		assert.htmlEqual(
			window.document.body.innerHTML,
			`<main><b id="r1">1</b><b id="r2">2</b><b id="r3">3</b></main>`
		);
	}
});
