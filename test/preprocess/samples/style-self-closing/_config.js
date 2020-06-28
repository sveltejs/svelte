import * as assert from "assert";

export default {
	preprocess: {
		style: ({ content, attributes: { color } }) => {
			assert.equal(content, undefined);
			return {
				code: `div { color: ${color}; }`
			};
		}
	}
};
