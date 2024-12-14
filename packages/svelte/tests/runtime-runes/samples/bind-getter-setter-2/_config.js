import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		assert.htmlEqual(target.innerHTML, `<div>123</div>`);

		assert.deepEqual(logs, ['123', '123']);
	}
});
