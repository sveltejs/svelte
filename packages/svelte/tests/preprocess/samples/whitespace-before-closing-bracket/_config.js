import { test } from '../../test';

export default test({
	preprocess: {
		script: ({ content }) => ({ code: content.replace('__NAME__', 'world') }),
		style: ({ content }) => ({ code: content.replace('red', 'blue') })
	}
});
