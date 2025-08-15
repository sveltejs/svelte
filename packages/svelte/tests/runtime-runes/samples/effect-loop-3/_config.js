import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	compileOptions: {
		dev: true
	},

	html: `1`.repeat(2000)
});
