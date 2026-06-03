import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		assert.htmlEqual(target.innerHTML, `<button>show</button> <div>hello</div>`);
		assert.deepEqual(logs, ['hello']);
	}
});
