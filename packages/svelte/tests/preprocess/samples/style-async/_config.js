import { test } from '../../test';

export default test({
	preprocess: {
		style: ({ content }) => {
			return Promise.resolve({
				code: content.replace('$brand', 'purple')
			});
		}
	}
});
