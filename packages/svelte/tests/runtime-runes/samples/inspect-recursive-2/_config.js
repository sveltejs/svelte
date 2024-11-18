import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, logs }) {
		var a = {
			a: null
		};
		a.a = a;
		assert.deepEqual(logs, ['init', { a }]);
	}
});
