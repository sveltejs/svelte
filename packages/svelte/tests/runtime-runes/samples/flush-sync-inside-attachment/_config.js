import { async_mode } from '../../../helpers';
import { test } from '../../test';

export default test({
	// In legacy mode this succeeds and logs 'hello'
	// In async mode this throws an error because flushSync is called inside an effect
	async test({ assert, target, logs }) {
		assert.htmlEqual(target.innerHTML, `<button>show</button> <div>hello</div>`);
		assert.deepEqual(logs, ['hello']);
	},
	runtime_error: async_mode ? 'flush_sync_in_effect' : undefined
});
