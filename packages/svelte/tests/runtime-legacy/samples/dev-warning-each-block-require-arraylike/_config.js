import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	error: '{#each} only works with iterable values.'
});
