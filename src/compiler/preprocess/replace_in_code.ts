import { getLocator } from 'locate-character';
import { StringWithSourcemap } from '../utils/string_with_sourcemap';

export interface Source {
	source: string;
	get_location: ReturnType<typeof getLocator>;
	filename: string;
}

export interface Replacement {
	offset: number;
	length: number;
	replacement: StringWithSourcemap;
}

export function perform_replacements(
	replacements: Replacement[],
	{ filename, source, get_location }: Source
): StringWithSourcemap {
	const out = new StringWithSourcemap();
	let last_end = 0;

	for (const { offset, length, replacement } of replacements) {
		const unchanged_prefix = StringWithSourcemap.from_source(
			filename, source.slice(last_end, offset), get_location(last_end));
		out.concat(unchanged_prefix).concat(replacement);
		last_end = offset + length;
	}

	const unchanged_suffix = StringWithSourcemap.from_source(
		filename, source.slice(last_end), get_location(last_end));

	return out.concat(unchanged_suffix);
}
