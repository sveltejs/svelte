import * as assert from "assert";

export default {
	preprocess: {
		script: ({ content, attributes }) => {
			assert.equal(content, "");
			return {
				code: `console.log("${attributes["the-answer"]}");`
			};
		}
	}
};
