import { test } from '../../test';

export default test({
	compileOptions: {
		warnings: {
			ignore: ['a11y_missing_attribute', 'a11y_misplaced_scope']
		}
	}
});
