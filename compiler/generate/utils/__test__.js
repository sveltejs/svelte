import * as assert from 'assert';
import deindent from './deindent.js';

describe( 'utils', () => {
	describe( 'deindent', () => {
		it( 'deindents a simple string', () => {
			const deindented = deindent`
				deindent me please
			`;

			assert.equal( deindented, `deindent me please` );
		});

		it( 'deindents a multiline string', () => {
			const deindented = deindent`
				deindent me please
				and me as well
			`;

			assert.equal( deindented, `deindent me please\nand me as well` );
		});

		it( 'preserves indentation of inserted values', () => {
			const insert = deindent`
				line one
				line two
			`;

			const deindented = deindent`
				before
					${insert}
				after
			`;

			assert.equal( deindented, `before\n\tline one\n\tline two\nafter` );
		});
	});
});
