import * as assert from 'assert';
import { trim_start, trim_end } from '../../src/compiler/utils/trim';

describe('utils', () => {
	describe('trim', () => {
		it('trim_start', () => {
			const value = trim_start('    content');
			assert.equal(value, 'content');
		});

    it('trim_end', () => {
			const value = trim_end('content    ');
			assert.equal(value, 'content');
		});
	});
});
