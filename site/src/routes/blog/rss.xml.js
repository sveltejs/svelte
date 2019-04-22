import send from '@polka/send';
import get_posts from '../blog/_posts.js';

const months = ',Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(',');

function formatPubdate(str) {
	const [y, m, d] = str.split('-');
	return `${d} ${months[+m]} ${y} 12:00 +0000`;
}

const rss = `
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">

<channel>
	<title>Svelte blog</title>
	<link>https://svelte.dev/blog</link>
	<description>News and information about the magical disappearing UI framework</description>
	<image>
		<url>https://svelte.dev/favicon.png</url>
		<title>Svelte</title>
		<link>https://svelte.dev/blog</link>
	</image>
	${get_posts().filter(post => !post.metadata.draft).map(post => `
		<item>
			<title>${post.metadata.title}</title>
			<link>https://svelte.dev/blog/${post.slug}</link>
			<description>${post.metadata.description}</description>
			<pubDate>${formatPubdate(post.metadata.pubdate)}</pubDate>
		</item>
	`).join('')}
</channel>

</rss>
`.replace(/>[^\S]+/gm, '>').replace(/[^\S]+</gm, '<').trim();

export function get(req, res) {
	send(res, 200, rss, {
		'Cache-Control': `max-age=${30 * 60 * 1e3}`,
		'Content-Type': 'application/rss+xml'
	});
}
