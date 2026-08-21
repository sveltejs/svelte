import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	mode: ['client'],

	error: 'each_key_volatile'
});
