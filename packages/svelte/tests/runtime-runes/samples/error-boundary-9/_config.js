import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		assert.deepEqual(logs, ['error caught']);
		assert.htmlEqual(target.innerHTML, `<div>Error!</div><button>Retry</button>`);
	}
});
