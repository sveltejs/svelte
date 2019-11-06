export default function get_name_from_filename(filename: string) {
	if (!filename) return null;

	const parts = filename.split(/[/\\]/).map(encodeURI);

	if (parts.length > 1) {
		const index_match = parts[parts.length - 1].match(/^index(\.\w+)/);
		if (index_match) {
			parts.pop();
			parts[parts.length - 1] += index_match[1];
		}
	}

	const base = parts.pop()
		.replace(/%/g, 'u')
		.replace(/\.[^.]+$/, "")
		.replace(/[^a-zA-Z_$0-9]+/g, '_')
		.replace(/^_/, '')
		.replace(/_$/, '')
		.replace(/^(\d)/, '_$1');

	if (!base) {
		throw new Error(`Could not derive component name from file ${filename}`);
	}

	return base[0].toUpperCase() + base.slice(1);
}