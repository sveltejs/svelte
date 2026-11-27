import { test } from '../../test';

export default test({
	warnings: ['a11y_missing_attribute'],
	expected: {
		body: '<!--[--><img src="image.png"/><!--]-->'
	}
});
