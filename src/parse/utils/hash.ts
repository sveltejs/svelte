// https://github.com/darkskyapp/string-hash/blob/master/index.js
export default function hash(str: string): number {
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return hash >>> 0;
}
