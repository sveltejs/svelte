import { test } from '../../test';

export default test({
	html: `<p>0</p>`,

	async test({ assert, target }) {
		target.click();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<p>1</p>');
	}
});
