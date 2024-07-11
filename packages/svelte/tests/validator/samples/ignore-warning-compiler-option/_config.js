import { test } from '../../test';

export default test({
	compileOptions: {
		filterWarnings: (warning) =>
			!['a11y_missing_attribute', 'a11y_misplaced_scope'].includes(warning.code)
	}
});
