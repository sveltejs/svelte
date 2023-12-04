import * as assert from 'node:assert';
import { test } from '../../test';

export default test({
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
});
