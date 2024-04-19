import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const btn = target.querySelector('button');

		await btn?.click();
		assert.htmlEqual(target.innerHTML, `<div><button>1</button></div>`);
	},
	runtime_error: 'nope'
});
