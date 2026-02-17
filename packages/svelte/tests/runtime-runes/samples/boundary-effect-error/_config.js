import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		// allow effects to run / microtasks to flush
		await Promise.resolve();

		assert.htmlEqual(target.innerHTML, '<p>caught: boom</p>');
	}
});
