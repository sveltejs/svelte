import * as assert from 'assert';

export default {
	preprocess: {
		style: ({ attributes }) => {
			assert.deepEqual(attributes, {
				type: 'text/scss',
				'data-foo': 'bar',
				bool: true
			});
			return { code: 'PROCESSED' };
		}
	}
};