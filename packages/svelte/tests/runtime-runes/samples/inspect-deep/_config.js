import { normalise_inspect_logs } from '../../../helpers.js';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, logs }) {
		assert.deepEqual(normalise_inspect_logs(logs), [undefined, [{}], 'at $effect']);
	}
});
