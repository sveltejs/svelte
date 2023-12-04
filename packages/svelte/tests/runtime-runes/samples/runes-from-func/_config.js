import { test } from '../../test';

export default test({
	html: '<span>0</span>',

	async test({ assert, target }) {
		await Promise.resolve();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, `<span>1</span>`);
	}
});
