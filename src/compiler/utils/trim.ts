import { regex_starts_with_whitespaces, regex_ends_with_whitespaces } from './patterns';

export function trim_start(str: string) {
	return str.replace(regex_starts_with_whitespaces, '');
}

export function trim_end(str: string) {
	return str.replace(regex_ends_with_whitespaces, '');
}
