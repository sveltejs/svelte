import { test } from '../../test';

export default test({
	preprocess: {
		markup: ({ content }) => {
			return {
				code: content.replace('__NAME__', 'world')
			};
		}
	}
});
