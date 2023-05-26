import * as assert from 'node:assert';

export default {
	preprocess: {
		style: ({ attributes }) => {
			assert.deepEqual(attributes, {
				lang: 'scss',
				'data-foo': 'bar',
				bool: true
			});
			return { code: 'PROCESSED', attributes: { sth: 'else' } };
		}
	}
};
