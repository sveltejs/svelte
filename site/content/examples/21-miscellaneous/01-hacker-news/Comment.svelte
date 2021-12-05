<script>
	export let comment;
</script>

<article>
	<p class="meta">{comment.user} {comment.time_ago}</p>

	{@html comment.content}

	<div class="replies">
		{#each comment.comments as child}
			<svelte:self comment={child}/>
		{/each}
	</div>
</article>

<style>
	article {
		border-top: 1px solid #eee;
		margin: 1em 0 0 0;
		padding: 1em 0 0 0;
		font-size: 14px;
	}

	.meta {
		color: #999;
	}

	.replies {
		padding: 0 0 0 1em;
	}
</style>