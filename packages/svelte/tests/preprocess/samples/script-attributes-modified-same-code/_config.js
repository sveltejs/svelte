import { test } from '../../test';

export default test({
	preprocess: {
		script: ({ content }) => ({ code: content, attributes: {} })
	}
});
