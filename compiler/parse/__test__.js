import * as assert from 'assert';
import parse from './index.js';

describe( 'parse', () => {
	it( 'is a function', () => {
		assert.equal( typeof parse, 'function' );
	});

	it( 'parses a single element', () => {
		const template = `<span>test</span>`;

		assert.deepEqual( parse( template ), {
			start: 0,
			end: 17,
			type: 'Fragment',
			children: [
				{
					start: 0,
					end: 17,
					type: 'Element',
					name: 'span',
					attributes: {},
					children: [
						{
							start: 6,
							end: 10,
							type: 'Text',
							data: 'test'
						}
					]
				}
			]
		});
	});
});
