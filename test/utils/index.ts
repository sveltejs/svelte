import * as assert from 'assert';
import { trim_start, trim_end } from '../../src/compiler/utils/trim';
import { split_css_unit } from '../../src/runtime/internal/utils';

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

	describe('split_css_unit', () => {
		it('should use px as default', () => {
			assert.deepEqual(split_css_unit(10), [10, 'px']);
			assert.deepEqual(split_css_unit('10'), [10, 'px']);
		});

		it('should use the fallback', () => {
			assert.deepEqual(split_css_unit(100, '%'), [100, '%']);
			assert.deepEqual(split_css_unit('100', '%'), [100, '%']);
		});

		it('should split the css notation into value and unit', () => {
			assert.deepEqual(split_css_unit('-50%'), [-50, '%']);
			assert.deepEqual(split_css_unit('0.1rem'), [0.1, 'rem']);
			assert.deepEqual(split_css_unit('.1rem'), [0.1, 'rem']);
		});

		it('should complain for invalid input', () => {
			const warnings = [];
			const warn = console.warn;
			console.warn = (...args) => {
				warnings.push(args);
			};

			split_css_unit('calc(100vw - 10rem)');
			split_css_unit(undefined);
			assert.deepEqual(split_css_unit('100 %'), [100, 'px']);
			assert.deepEqual(warnings, [
				['Failed to split', 'calc(100vw - 10rem)'],
				['Failed to split', undefined],
				['Failed to split', '100 %']
			]);

			console.warn = warn;
		});
	});
});
