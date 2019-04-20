import get_posts from './_posts.js';

let json;

export function get(req, res) {
	if (!json || process.env.NODE_ENV !== 'production') {
		const posts = get_posts()
			.filter(post => !post.metadata.draft)
			.map(post => {
				return {
					slug: post.slug,
					metadata: post.metadata
				};
			});

		json = JSON.stringify(posts);
	}

	res.set({
		'Content-Type': 'application/json',
		'Cache-Control': `max-age=${5 * 60 * 1e3}` // 5 minutes
	});
	res.end(json);
}