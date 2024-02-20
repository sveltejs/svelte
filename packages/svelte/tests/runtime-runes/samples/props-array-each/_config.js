import { test } from '../../test';

export default test({
	html: `<button>add</button> <p>1</p><p>1</p><p>1</p>`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		await btn?.click();
		assert.htmlEqual(
			target.innerHTML,
			`<button>add</button> <p>1</p><p>2</p><p>1</p><p>2</p><p>1</p><p>2</p>`
		);
	}
});
