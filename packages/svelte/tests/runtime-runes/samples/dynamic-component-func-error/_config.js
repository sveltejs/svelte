import { test } from '../../test';

export default test({
	expect_unhandled_rejections: true,
	error: 'is not a function',
	compileOptions: {
		dev: true
	}
});
