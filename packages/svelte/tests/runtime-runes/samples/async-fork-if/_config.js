import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const btn = target.querySelector('button');

		btn?.click();
		await new Promise((r) => setTimeout(r, 2));
		assert.htmlEqual(target.innerHTML, `<button>fork</button> universe`);
		assert.deepEqual(logs, ['universe', 'universe']);
	}
});
