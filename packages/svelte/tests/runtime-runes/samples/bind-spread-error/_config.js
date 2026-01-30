import { test } from '../../test';

export default test({
	expect_unhandled_rejections: true,
	compileOptions: {
		dev: true
	},
	error: 'invalid_spread_binding'
});
