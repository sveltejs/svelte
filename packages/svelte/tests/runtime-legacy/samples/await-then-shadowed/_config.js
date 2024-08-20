import { test } from '../../test';

export default test({
	solo: true,

	html: '<div>Loading...</div>',

	async test({ assert, target }) {
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<div>10</div>');
	}
});
