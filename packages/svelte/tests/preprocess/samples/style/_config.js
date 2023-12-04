import { test } from '../../test';

export default test({
	preprocess: {
		style: ({ content }) => {
			return {
				code: content.replace('$brand', 'purple')
			};
		}
	}
});
