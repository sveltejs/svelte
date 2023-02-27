import { regex_starts_with_underscore, regex_ends_with_underscore } from '../../utils/patterns';

const regex_percentage_characters = /%/g;
const regex_file_ending = /\.[^.]+$/;
const regex_repeated_invalid_variable_identifier_characters = /[^a-zA-Z_$0-9]+/g;
const regex_starts_with_digit = /^(\d)/;

export default function get_name_from_filename(filename: string) {
	if (!filename) return null;

	const parts = filename.split(/[/\\]/).map(encodeURI);

	if (parts.length > 1) {
		const index_match = parts[parts.length - 1].match(/^index(\.\w+)/);
		if (index_match) {
			parts.pop();
			parts[parts.length - 1] += index_match[1];
		}
	}

	const base = parts.pop()
		.replace(regex_percentage_characters, 'u')
		.replace(regex_file_ending, '')
		.replace(regex_repeated_invalid_variable_identifier_characters, '_')
		.replace(regex_starts_with_underscore, '')
		.replace(regex_ends_with_underscore, '')
		.replace(regex_starts_with_digit, '_$1');

	if (!base) {
		throw new Error(`Could not derive component name from file ${filename}`);
	}

	return base[0].toUpperCase() + base.slice(1);
}
