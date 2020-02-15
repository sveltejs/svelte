function tabs_to_spaces(str: string) {
	return str.replace(/^\t+/, match => match.split('\t').join('  '));
}

export default function get_code_frame(
	source: string,
	line: number,
	column: number
) {
	const lines = source.split('\n');

	const frame_start = Math.max(0, line - 2);
	const frame_end = Math.min(line + 3, lines.length);

	const digits = String(frame_end + 1).length;

	return lines
		.slice(frame_start, frame_end)
		.map((str, i) => {
			const isErrorLine = frame_start + i === line;
			const line_num = String(i + frame_start + 1).padStart(digits, ' ');

			if (isErrorLine) {
				const indicator = ' '.repeat(digits + 2 + tabs_to_spaces(str.slice(0, column)).length) + '^';
				return `${line_num}: ${tabs_to_spaces(str)}\n${indicator}`;
			}

			return `${line_num}: ${tabs_to_spaces(str)}`;
		})
		.join('\n');
}
