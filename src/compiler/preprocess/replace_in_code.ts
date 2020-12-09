import { getLocator } from 'locate-character';
import { StringWithSourcemap } from '../utils/string_with_sourcemap';

export interface Source {
	source: string;
	get_location: ReturnType<typeof getLocator>;
	filename: string;
}

interface Replacement {
	offset: number;
	length: number;
	replacement: StringWithSourcemap;
}

function calculate_replacements(
	re: RegExp,
	get_replacement: (...match: any[]) => Promise<StringWithSourcemap>,
	source: string
) {
	const replacements: Array<Promise<Replacement>> = [];

	source.replace(re, (...match) => {
		replacements.push(
			get_replacement(...match).then(
				replacement => {
					const matched_string = match[0];
					const offset = match[match.length-2];

					return ({ offset, length: matched_string.length, replacement });
				}
			)
		);
		return '';
	});

	return Promise.all(replacements);
}

function perform_replacements(
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

export async function replace_in_code(
	regex: RegExp,
	get_replacement: (...match: any[]) => Promise<StringWithSourcemap>,
	location: Source
): Promise<StringWithSourcemap> {
	const replacements = await calculate_replacements(regex, get_replacement, location.source);

	return perform_replacements(replacements, location);
}
