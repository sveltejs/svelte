export function get(req, res) {
	res.writeHead(302, { Location: 'https://github.com/sveltejs/svelte/wiki/FAQ' });
	res.end();
}