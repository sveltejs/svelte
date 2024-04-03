import { test } from '../../test';

export default test({
	skip: true, // TODO: needs fixing

	compileOptions: {
		dev: true
	},
	error: '{#each} only works with iterable values.'
});
