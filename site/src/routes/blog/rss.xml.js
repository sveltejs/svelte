import get_posts from '../api/blog/_posts.js';

const months = ',Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split( ',' );

function formatPubdate ( str ) {
	const [ y, m, d ] = str.split( '-' );
	return `${d} ${months[+m]} ${y}`;
}

const rss = `
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">

<channel>
	<title>Svelte blog</title>
	<link>https://svelte.technology/blog</link>
	<description>News and information about the magical disappearing UI framework</description>
	<image>
		<url>https://svelte.technology/favicon.png</url>
		<title>Svelte</title>
		<link>https://svelte.technology/blog</link>
	</image>
	${get_posts().map( post => `
		<item>
			<title>${post.metadata.title}</title>
			<link>https://svelte.technology/blog/${post.slug}</link>
			<description>${post.metadata.description}</description>
			<pubDate>${formatPubdate(post.metadata.pubdate)}</pubDate>
		</item>
	` )}
</channel>

</rss>
`.replace( />[^\S]+/gm, '>' ).replace( /[^\S]+</gm, '<' ).trim();

export function get(req, res) {
	res.set({
		'Cache-Control': `max-age=${30 * 60 * 1e3}`,
		'Content-Type': 'application/rss+xml'
	});
	res.end(rss);
}