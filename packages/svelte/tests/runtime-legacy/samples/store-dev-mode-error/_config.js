import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	get props() {
		return { count: 0 };
	},

	error: 'store_invalid_shape\n`count` is not a store with a `subscribe` method'
});
