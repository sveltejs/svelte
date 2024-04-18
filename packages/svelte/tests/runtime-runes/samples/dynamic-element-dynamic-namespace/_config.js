import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		assert.equal(target.querySelector('path')?.namespaceURI, 'http://www.w3.org/2000/svg');

		await target.querySelector('button')?.click();
		assert.equal(target.querySelector('div')?.namespaceURI, 'http://www.w3.org/1999/xhtml');
	}
});
