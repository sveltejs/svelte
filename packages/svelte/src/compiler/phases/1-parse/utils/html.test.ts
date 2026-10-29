import { expect, test } from 'vitest';
import { find_raw_character_reference_boundary } from './html.js';

function find_boundary(html: string, whitespace: string, from_start: boolean) {
	return find_raw_character_reference_boundary(html, whitespace, false, from_start);
}

test('finds raw boundaries for decoded whitespace around text', () => {
	expect(find_boundary('&#32;&#32;Hello', '  ', true)).toBe(10);
	expect(find_boundary('Hello&#32;&#32;', '  ', false)).toBe(5);
	expect(find_boundary(' \t&#32;Hello', ' \t ', true)).toBe(7);
});

test('handles adjacent character references without semicolons', () => {
	expect(find_boundary('&#32&#32Hello', '  ', true)).toBe(8);
});

test('handles long runs of encoded whitespace', () => {
	const raw = '&#32;'.repeat(10_000);
	const whitespace = ' '.repeat(10_000);

	expect(find_boundary(raw, whitespace, true)).toBe(raw.length);
	expect(find_boundary(raw, whitespace, false)).toBe(0);
});
