import * as assert from 'node:assert';
import { test } from '../../test';

export default test({
	preprocess: {
		script: ({ content, attributes }) => {
			assert.equal(content, '');
			return {
				code: `console.log("${attributes['the-answer']}");`
			};
		}
	}
});
