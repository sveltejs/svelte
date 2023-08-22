/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	return await resolve(event, {
		preload: ({ type }) => type === 'js' || type === 'css' || type === 'font'
	});
}
