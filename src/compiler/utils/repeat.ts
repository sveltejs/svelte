export default function repeat(str: string, i: number) {
	let result = '';
	while (i--) result += str;
	return result;
}
