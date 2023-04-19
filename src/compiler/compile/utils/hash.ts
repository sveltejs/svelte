// https://github.com/darkskyapp/string-hash/blob/master/index.js

const regex_return_characters = /\r/g;

export default function hash(str: string): string {
	str = str.replace(regex_return_characters, '');
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return (hash >>> 0).toString(36);
}
