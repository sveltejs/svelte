import { test } from '../../test';

export default test({
	compileOptions: {
		compatibility: {
			componentApi: 4
		}
	},

	async test({ assert, target }) {
		await Promise.resolve();

		assert.htmlEqual(target.innerHTML, `<div><p>1</p></div>`);
	}
});
