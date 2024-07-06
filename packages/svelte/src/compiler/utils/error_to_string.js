/**
 * @param {string} code
 * @param {string} message
 * @param {string | undefined} filename
 * @param {import("locate-character").Location | undefined} start
 * @param {string | undefined} frame
 */
export function error_to_string(code, message, filename, start, frame) {
	let out = `${code}: ${message}`;

	if (filename) {
		out += `\n${filename}`;

		if (start) {
			out += `:${start.line}:${start.column}`;
		}
	}

	if (frame) {
		out += `\n${frame}`;
	}

	return out;
}
