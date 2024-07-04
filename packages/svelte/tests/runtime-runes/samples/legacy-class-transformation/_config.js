import { test } from '../../test';

export default test({
	compileOptions: {
		compatibility: {
			legacyComponent: true
		}
	},

	async test({ assert, target }) {
		await Promise.resolve();

		assert.htmlEqual(target.innerHTML, `<div><p>1</p></div>`);
	}
});
