import { test } from '../../test';

export default test({
	preprocess: {
		script: ({ content, attributes }) => ({ code: content, attributes })
	}
});
