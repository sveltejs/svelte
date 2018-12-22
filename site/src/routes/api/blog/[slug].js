import get_posts from './_posts.js';

let lookup;

export function get(req, res) {
	if (!lookup || process.env.NODE_ENV !== 'production') {
		lookup = new Map();
		get_posts().forEach(post => {
			lookup.set(post.slug, JSON.stringify(post));
		});
	}

	if (lookup.has(req.params.slug)) {
		res.set({
			'Content-Type': 'application/json',
			'Cache-Control': `max-age=${5 * 60 * 1e3}` // 5 minutes
		});
		res.end(lookup.get(req.params.slug));
	}
}