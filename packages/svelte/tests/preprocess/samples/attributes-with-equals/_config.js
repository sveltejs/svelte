import { test } from '../../test';

export default test({
	preprocess: {
		style: ({ attributes }) => {
			if (typeof attributes.foo === 'string' && attributes.foo.includes('=')) {
				return { code: '' };
			}
		}
	}
});
