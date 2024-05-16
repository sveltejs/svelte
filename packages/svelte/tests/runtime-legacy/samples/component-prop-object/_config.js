import { test } from '../../test';

export default test({
	html: `child: 0 parent: 0 <button>inc x</button>`,

	async test({ assert, target }) {
		await target.querySelector('button')?.click();
		assert.htmlEqual(target.innerHTML, `child: 1 parent: 1 <button>inc x</button>`);
	}
});
