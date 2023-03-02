import * as assert from 'assert';
import { trim_start, trim_end } from '../../src/compiler/utils/trim';

describe('utils', () => {
	describe('trim', () => {
		it('trim_start', () => {
			const value = trim_start('	\r\n\t svelte content \r\n\t	');
			assert.equal(value, 'svelte content \r\n\t	');
		});

		it('trim_end', () => {
			const value = trim_end('	\r\n\t svelte content \r\n\t	');
			assert.equal(value, '	\r\n\t svelte content');
		});
	});
});
