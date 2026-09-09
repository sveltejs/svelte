import { expect, test } from 'vitest';
import { REGEX_VALID_TAG_NAME } from './utils';

test('REGEX_VALID_TAG_NAME accepts common HTML tag names', () => {
	const common_html_tag_names = ['div', 'span', 'button', 'input', 'svg', 'math', 'a'];

	for (const tag_name of common_html_tag_names) {
		expect(REGEX_VALID_TAG_NAME.test(tag_name)).toBe(true);
	}
});

test('REGEX_VALID_TAG_NAME accepts basic custom element names', () => {
	const valid_custom_tag_names = ['my-element', 'x-foo', 'todo-item', 'my-element2'];

	for (const tag_name of valid_custom_tag_names) {
		expect(REGEX_VALID_TAG_NAME.test(tag_name)).toBe(true);
	}
});

test('REGEX_VALID_TAG_NAME accepts spec-allowed custom element characters', () => {
	const valid_custom_tag_names = [
		'x-foo.bar',
		'x-foo_bar',
		'x-foo\u00B7bar',
		'x-foo\u00FCbar',
		'x-foo\u{1F600}bar',
		'x-'
	];

	for (const tag_name of valid_custom_tag_names) {
		expect(REGEX_VALID_TAG_NAME.test(tag_name)).toBe(true);
	}
});

test('REGEX_VALID_TAG_NAME rejects invalid tag names', () => {
	const invalid_tag_names = ['', '1', 'x\u00FC', '-x-foo', '1foo', 'x-foo bar', 'x-foo/', 'x-foo>'];

	for (const tag_name of invalid_tag_names) {
		expect(REGEX_VALID_TAG_NAME.test(tag_name)).toBe(false);
	}
});

test('REGEX_VALID_TAG_NAME no ReDoS', () => {
	const before = performance.now();
	REGEX_VALID_TAG_NAME.test('a-----------------------------------!');
	const after = performance.now();
	if (after - before > 10) {
		throw new Error(`REGEX_VALID_TAG_NAME is vulnerable to ReDoS`);
	}
});
