import { test } from '../../test';

export default test({
	preprocess: {
		script: ({ content }) => {
			return {
				code: content.toLowerCase()
			};
		}
	}
});
