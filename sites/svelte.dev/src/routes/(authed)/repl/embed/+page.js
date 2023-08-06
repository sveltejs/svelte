export function load({ url }) {
	const query = url.searchParams;
	return {
		version: query.get('version') || '3',
		gist: query.get('gist'),
		example: query.get('example')
	};
}
