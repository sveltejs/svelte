// asynchronous String#replace

export default async function replaceAsync(
	str: string,
	re: RegExp,
	func: (...any) => Promise<string>
) {
	const replacements: Promise<Replacement>[] = [];
	str.replace(re, (...args) => {
		replacements.push(
			func(...args).then(
				res =>
					<Replacement>{
						offset: args[args.length - 2],
						length: args[0].length,
						replacement: res,
					}
			)
		);
		return '';
	});
	let out = '';
	let lastEnd = 0;
	for (const { offset, length, replacement } of await Promise.all(
		replacements
	)) {
		out += str.slice(lastEnd, offset) + replacement;
		lastEnd = offset + length;
	}
	out += str.slice(lastEnd);
	return out;
}

interface Replacement {
	offset: number;
	length: number;
	replacement: string;
}
