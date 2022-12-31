<script>
	export let item;
	export let i;
	export let offset;

	function comment_text() {
		const c = item.comments_count;
		return `${c} ${c === 1 ? 'comment' : 'comments'}`;
	}

	$: url = item.type === "ask" ? `https://news.ycombinator.com/${item.url}` : item.url;
</script>

<article>
	<span>{i + offset + 1}</span>
	<h2><a target="_blank" rel="noreferrer" href={url}>{item.title}</a></h2>
	<p class="meta"><a href="#/item/{item.id}">{comment_text()}</a> by {item.user} {item.time_ago}</p>
</article>

<style>
	article {
		position: relative;
		padding: 0 0 0 2em;
		border-bottom: 1px solid #eee;
	}

	h2 {
		font-size: 1em;
		margin: 0.5em 0;
	}

	span {
		position: absolute;
		left: 0;
	}

	a {
		color: #333;
	}
</style>
