import { MappedCode } from '../utils/mapped_code';
import { Source } from './types';

interface Replacement {
	offset: number;
	length: number;
	replacement: MappedCode;
}

export function slice_source(
	code_slice: string,
	offset: number,
	{ file_basename, filename, get_location }: Source
): Source {
	return {
		source: code_slice,
		get_location: (index: number) => get_location(index + offset),
		file_basename,
		filename
	};
}

function calculate_replacements(
	re: RegExp,
	get_replacement: (...match: any[]) => Promise<MappedCode>,
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
	source: Source
): MappedCode {
	const out = new MappedCode();
	let last_end = 0;

	for (const { offset, length, replacement } of replacements) {
		const unchanged_prefix = MappedCode.from_source(
			slice_source(source.source.slice(last_end, offset), last_end, source)
		);
		out.concat(unchanged_prefix).concat(replacement);
		last_end = offset + length;
	}

	const unchanged_suffix = MappedCode.from_source(slice_source(source.source.slice(last_end), last_end, source));

	return out.concat(unchanged_suffix);
}

export async function replace_in_code(
	regex: RegExp,
	get_replacement: (...match: any[]) => Promise<MappedCode>,
	location: Source
): Promise<MappedCode> {
	const replacements = await calculate_replacements(regex, get_replacement, location.source);

	return perform_replacements(replacements, location);
}
