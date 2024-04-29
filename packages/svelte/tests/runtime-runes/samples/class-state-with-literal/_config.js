import { test } from '../../test';

export default test({
	html: `<button>false</button>`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		await btn?.click();
		assert.htmlEqual(target.innerHTML, `<button>true</button>`);

		await btn?.click();
		assert.htmlEqual(target.innerHTML, `<button>false</button>`);
	}
});
