import { test } from '../../test';

export default test({
	compileOptions: {
		legacy: {
			componentApi: true
		}
	},

	async test({ assert, target }) {
		await Promise.resolve();

		assert.htmlEqual(target.innerHTML, `<div><p>1</p></div>`);
	}
});
