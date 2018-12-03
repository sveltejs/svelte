const start = /\n(\t+)/;

export default function deindent(
	strings: TemplateStringsArray,
	...values: any[]
) {
	const indentation = start.exec(strings[0])[1];
	const pattern = new RegExp(`^${indentation}`, 'gm');

	let result = strings[0].replace(start, '').replace(pattern, '');

	let current_indentation = get_current_indentation(result);

	for (let i = 1; i < strings.length; i += 1) {
		let expression = values[i - 1];
		const string = strings[i].replace(pattern, '');

		if (Array.isArray(expression)) {
			expression = expression.length ? expression.join('\n') : null;
		}

		// discard empty codebuilders
		if (expression && expression.isEmpty && expression.isEmpty()) {
			expression = null;
		}

		if (expression || expression === '') {
			const value = String(expression).replace(
				/\n/g,
				`\n${current_indentation}`
			);
			result += value + string;
		} else {
			let c = result.length;
			while (/\s/.test(result[c - 1])) c -= 1;
			result = result.slice(0, c) + string;
		}

		current_indentation = get_current_indentation(result);
	}

	return result.trim().replace(/\t+$/gm, '');
}

function get_current_indentation(str: string) {
	let a = str.length;
	while (a > 0 && str[a - 1] !== '\n') a -= 1;

	let b = a;
	while (b < str.length && /\s/.test(str[b])) b += 1;

	return str.slice(a, b);
}
