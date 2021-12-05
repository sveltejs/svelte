import get_posts from './_posts.js';

let lookup;

export function get({ params }) {
	if (!lookup || process.env.NODE_ENV !== 'production') {
		lookup = new Map();
		get_posts().forEach(post => {
			lookup.set(post.slug, post);
		});
	}

	const post = lookup.get(params.slug);

	if (post) {
		return {
			body: post,
			headers: {
				'Cache-Control': `max-age=${5 * 60 * 1e3}` // 5 minutes
			}
		};
	}
}
