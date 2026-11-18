import { assert, describe, test } from 'vitest';
import { to_style } from './attributes';

// `to_style` combines a `style` attribute with `style:` directives. Properties set by directives
// are removed from the attribute and appended (unless they're nullish or empty)
describe('to_style', () => {
	test('without directives, returns the attribute as is', () => {
		assert.equal(to_style('color: red'), 'color: red');
		assert.equal(to_style(null), null);
	});

	test('adds directives to an empty attribute', () => {
		assert.equal(to_style(null, { color: 'red' }), 'color: red;');
		assert.equal(to_style('', { color: null }), null);
	});

	test('replaces properties set by directives, preserving others', () => {
		assert.equal(
			to_style('color: red; background: blue', { color: 'green' }),
			'background: blue; color: green;'
		);
	});

	test('removes properties whose directives are nullish', () => {
		assert.equal(to_style('color: red; background: blue', { color: null }), 'background: blue;');
		assert.equal(to_style('color: red', { color: null }), null);
	});

	test('supports important directives', () => {
		assert.equal(to_style('color: red', [{}, { color: 'green' }]), 'color: green !important;');
	});

	test('preserves semicolons inside strings', () => {
		assert.equal(
			to_style('content: "a;b"; color: red', { color: 'green' }),
			'content: "a;b"; color: green;'
		);
		assert.equal(
			to_style("content: 'x;y;z'; color: red", { color: 'green' }),
			"content: 'x;y;z'; color: green;"
		);
	});

	test('preserves semicolons inside url(...)', () => {
		assert.equal(
			to_style('background: url(data:image/png;base64,AAAA); color: red', { color: 'green' }),
			'background: url(data:image/png;base64,AAAA); color: green;'
		);
		assert.equal(
			to_style('background: url(data:image/png;base64,AAAA); color: red', { background: null }),
			'color: red;'
		);
	});

	test('ignores semicolons inside comments', () => {
		assert.equal(
			to_style('color: red /* a;b */; background: blue', { background: 'green' }),
			'color: red; background: green;'
		);
	});

	test('an escaped quote does not end a string', () => {
		assert.equal(
			to_style('content: "a\\";b"; color: red', { color: 'green' }),
			'content: "a\\";b"; color: green;'
		);
	});

	test('an escaped backslash before a quote does not escape it', () => {
		assert.equal(to_style('content: "a\\\\"; color: red', { color: null }), 'content: "a\\\\";');
	});

	test('an escaped semicolon does not end a declaration', () => {
		assert.equal(to_style('--text: a\\;b; color: red', { color: null }), '--text: a\\;b;');
		// ...including at the very end
		assert.equal(to_style('color: red; --text: a\\;', { color: null }), '--text: a\\;;');
	});
});
