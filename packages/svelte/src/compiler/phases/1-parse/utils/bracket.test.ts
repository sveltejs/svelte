import { describe, expect, it } from 'vitest';
import { find_matching_bracket, get_bracket_close } from './bracket';
import full_char_code_at from './full_char_code_at';

describe('find_matching_bracket', () => {
	it.each([
		{
			name: 'no-gotchas-const',
			template: `{@const foo = bar}`,
			start: '{',
			index: 1,
			expected: 17
		},
		{
			name: 'no-gotchas-snippet',
			template: `{#snippet foo(bar, baz)}`,
			start: '{',
			index: 1,
			expected: 23
		},
		{
			name: 'multiple-bracket-pairs-snippet',
			template: `{#snippet foo(bar, { baz })}`,
			start: '{',
			index: 1,
			expected: 27
		},
		{
			name: 'unbalanced-brackets-snippet',
			template: `{#snippet foo(bar, { baz })`,
			start: '{',
			index: 1,
			expected: undefined
		},
		{
			name: 'singlequote-string-snippet',
			template: `{#snippet foo(bar = '}')}`,
			start: '{',
			index: 1,
			expected: 24
		},
		{
			name: 'doublequote-string-snippet',
			template: `{#snippet foo(bar = "}")}`,
			start: '{',
			index: 1,
			expected: 24
		},
		{
			name: 'backquote-string-snippet',
			template: '{#snippet foo(bar = `}`)}',
			start: '{',
			index: 1,
			expected: 24
		},
		{
			name: 'multiline-backquote-string-snippet',
			template: `{#snippet foo(bar = \`}
			\`)}`,
			start: '{',
			index: 1,
			expected: 28
		},
		{
			name: 'escaped-string-delimiter-snippet',
			template: `{#snippet foo(bar = '\\'')}`,
			start: '{',
			index: 1,
			expected: 25
		},
		{
			name: 'regex-snippet',
			template: `{#snippet foo(bar = /foobar'"/)}`,
			start: '{',
			index: 1,
			expected: 31
		},
		{
			name: 'inline-multiline-comment-snippet',
			template: `{#snippet foo(bar /*inline multiline comment*/)}`,
			start: '{',
			index: 1,
			expected: 47
		},
		{
			name: 'linebreak-multiline-comment-snippet',
			template: `{#snippet foo(bar /*inline multiline comment
			*/)
			}`,
			start: '{',
			index: 1,
			expected: 55
		},
		{
			name: 'confusing-singleline-comment-snippet',
			template: `{#snippet foo(bar) // this comment removes the bracket inside of it }
		}`,
			start: '{',
			index: 1,
			expected: 72
		}
	])('finds the matching bracket ($name)', ({ template, index, start, expected }) => {
		const matched_bracket_location = find_matching_bracket(template, index, start);
		expect(matched_bracket_location).toBe(expected);
		if (matched_bracket_location) {
			expect(get_bracket_close(full_char_code_at(start, 0))).toBe(
				full_char_code_at(template[matched_bracket_location], 0)
			);
		}
	});
});
