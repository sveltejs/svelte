import { test } from '../../test';

export default test({
	skip: true,
	compileOptions: {
		// @ts-expect-error
		enableSourcemap: { js: true }
	}
});
