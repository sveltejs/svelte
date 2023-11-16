import { test } from '../../test';

export default test({
	preprocess: {
		script: ({ attributes }) =>
			typeof attributes.generics === 'string' && attributes.generics.includes('>')
				? { code: '' }
				: undefined
	}
});
