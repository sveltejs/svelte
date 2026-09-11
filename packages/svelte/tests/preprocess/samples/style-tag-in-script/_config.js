import * as assert from 'node:assert';
import { test } from '../../test';

export default test({
	preprocess: {
		style: ({ content }) => {
			assert.equal(content, 'BEFORE');
			return {
				code: 'PROCESSED'
			};
		}
	}
});
