import { test } from '../../test';

export default test({
	html: `<button>00</button>`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');
		await btn?.click();

		assert.htmlEqual(target.innerHTML, `<button>01</button>`);
	}
});
