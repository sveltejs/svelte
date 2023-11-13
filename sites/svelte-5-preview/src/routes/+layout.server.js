export const prerender = true;

/** @type {import('@sveltejs/adapter-vercel').EdgeConfig} */
export const config = {
	runtime: 'edge'
};

export const load = async ({ fetch }) => {
	const nav_data = await fetch('/nav.json').then((r) => r.json());

	return { nav_links: nav_data };
};
