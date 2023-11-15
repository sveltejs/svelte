import * as assert from 'node:assert';
import { test } from '../../test';

export default test({
	preprocess: {
		style: ({ attributes }) => {
			assert.deepEqual(attributes, {
				lang: 'scss'
			});
			return { code: 'PROCESSED', attributes: { sth: 'wayyyyyyyyyyyyy looooooonger' } };
		}
	}
});
