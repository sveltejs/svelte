import * as assert from 'node:assert';

export default {
	preprocess: {
		style: ({ attributes }) => {
			assert.deepEqual(attributes, {
				lang: 'scss'
			});
			return { code: 'PROCESSED', attributes: { sth: 'wayyyyyyyyyyyyy looooooonger' } };
		}
	}
};
