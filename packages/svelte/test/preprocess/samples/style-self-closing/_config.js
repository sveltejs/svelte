import * as assert from 'node:assert';

export default {
	preprocess: {
		style: ({ content, attributes: { color } }) => {
			assert.equal(content, '');
			return {
				code: `div { color: ${color}; }`
			};
		}
	}
};
