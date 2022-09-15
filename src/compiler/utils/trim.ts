import { regex_starts_with_whitespace, regex_ends_with_whitespace } from './patterns';

export function trim_start(str: string) {
	return str.replace(regex_starts_with_whitespace, '');
}

export function trim_end(str: string) {
	return str.replace(regex_ends_with_whitespace, '');
}
