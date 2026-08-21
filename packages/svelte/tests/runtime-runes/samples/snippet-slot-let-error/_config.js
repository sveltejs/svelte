import { test } from '../../test';

export default test({
	skip_mode: ['hydrate', 'server'],
	compileOptions: {
		dev: true
	},
	runtime_error: 'invalid_default_snippet'
});
