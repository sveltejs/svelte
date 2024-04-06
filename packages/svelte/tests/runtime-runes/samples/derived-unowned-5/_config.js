import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		// The test has a bunch of queueMicrotasks
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

		assert.htmlEqual(target.innerHTML, `<div>Zeeba Neighba</div>`);
	}
});
