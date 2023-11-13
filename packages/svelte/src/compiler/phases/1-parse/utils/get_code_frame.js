const regex_tabs = /^\t+/;

/** @param {string} str */
function tabs_to_spaces(str) {
	return str.replace(regex_tabs, /** @param {any} match */ (match) => match.split('\t').join('  '));
}

/**
 * @param {string} source
 * @param {number} line
 * @param {number} column
 */
export default function get_code_frame(source, line, column) {
	const lines = source.split('\n');

	const frame_start = Math.max(0, line - 2);
	const frame_end = Math.min(line + 3, lines.length);

	const digits = String(frame_end + 1).length;

	return lines
		.slice(frame_start, frame_end)
		.map(
			/**
			 * @param {any} str
			 * @param {any} i
			 */ (str, i) => {
				const is_error_line = frame_start + i === line;
				const line_num = String(i + frame_start + 1).padStart(digits, ' ');

				if (is_error_line) {
					const indicator =
						' '.repeat(digits + 2 + tabs_to_spaces(str.slice(0, column)).length) + '^';
					return `${line_num}: ${tabs_to_spaces(str)}\n${indicator}`;
				}

				return `${line_num}: ${tabs_to_spaces(str)}`;
			}
		)
		.join('\n');
}
