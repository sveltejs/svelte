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

	it( 'parses an {{#if}}...{{/if}} block', () => {
		const template = `{{#if foo}}bar{{/if}}`;

		assert.deepEqual( parse( template ), {
			html: {
				start: 0,
				end: 21,
				type: 'Fragment',
				children: [
					{
						start: 0,
						end: 21,
						type: 'IfBlock',
						expression: {
							start: 6,
							end: 9,
							type: 'Identifier',
							name: 'foo'
						},
						children: [
							{
								start: 11,
								end: 14,
								type: 'Text',
								data: 'bar'
							}
						]
					}
				]
			},
			css: null,
			js: null
		});
	});

	it( 'parses an {{#each}}...{{/each}} block', () => {
		const template = `{{#each animals as animal}}<p>{{animal}}</p>{{/each}}`;

		assert.deepEqual( parse( template ), {
			html: {
				start: 0,
				end: 53,
				type: 'Fragment',
				children: [
					{
						start: 0,
						end: 53,
						type: 'EachBlock',
						expression: {
							start: 8,
							end: 15,
							type: 'Identifier',
							name: 'animals'
						},
						context: 'animal',
						children: [
							{
								start: 27,
								end: 44,
								type: 'Element',
								name: 'p',
								attributes: [],
								children: [
									{
										start: 30,
										end: 40,
										type: 'MustacheTag',
										expression: {
											start: 32,
											end: 38,
											type: 'Identifier',
											name: 'animal'
										}
									}
								]
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
