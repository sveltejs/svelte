import * as assert from 'assert';
import parse from './index.js';

describe( 'parse', () => {
	it( 'is a function', () => {
		assert.equal( typeof parse, 'function' );
	});

	it( 'parses a self-closing element', () => {
		const template = '<div/>';

		assert.deepEqual( parse( template ), {
			html: {
				start: 0,
				end: 6,
				type: 'Fragment',
				children: [
					{
						start: 0,
						end: 6,
						type: 'Element',
						name: 'div',
						attributes: [],
						children: []
					}
				]
			},
			css: null,
			js: null
		});
	});

	it( 'parses an element with text', () => {
		const template = `<span>test</span>`;

		assert.deepEqual( parse( template ), {
			html: {
				start: 0,
				end: 17,
				type: 'Fragment',
				children: [
					{
						start: 0,
						end: 17,
						type: 'Element',
						name: 'span',
						attributes: [],
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
			},
			css: null,
			js: null
		});
	});

	it( 'parses an element with a mustache tag', () => {
		const template = `<h1>hello {{name}}!</h1>`;

		assert.deepEqual( parse( template ), {
			html: {
				start: 0,
				end: 24,
				type: 'Fragment',
				children: [
					{
						start: 0,
						end: 24,
						type: 'Element',
						name: 'h1',
						attributes: [],
						children: [
							{
								start: 4,
								end: 10,
								type: 'Text',
								data: 'hello '
							},
							{
								start: 10,
								end: 18,
								type: 'MustacheTag',
								expression: {
									start: 12,
									end: 16,
									type: 'Identifier',
									name: 'name'
								}
							},
							{
								start: 18,
								end: 19,
								type: 'Text',
								data: '!'
							}
						]
					}
				]
			},
			css: null,
			js: null
		});
	});
});
