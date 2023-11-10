import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	error:
		"Cannot have duplicate keys in a keyed each: Keys at index 0 and 3 with value '1' are duplicates"
});
