import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	error: 'each_key_duplicate\nKeyed each block has duplicate key `1` at indexes 0 and 3'
});
