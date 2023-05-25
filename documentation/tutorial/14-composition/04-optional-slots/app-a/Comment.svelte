<script>
	export let name;
	export let postedAt;

	$: avatar = `https://ui-avatars.com/api/?name=${name.replace(
		/ /g,
		'+'
	)}&rounded=true&background=ff3e00&color=fff&bold=true`;
</script>

<article>
	<div class="header">
		<img src={avatar} alt="" height="32" width="32" />
		<div class="details">
			<h4>{name}</h4>
			<time datetime={postedAt.toISOString()}>{postedAt.toLocaleDateString()}</time>
		</div>
	</div>
	<div class="body">
		<slot />
	</div>
</article>

<style>
	article {
		background-color: #fff;
		border: 1px #ccc solid;
		border-radius: 4px;
		padding: 1rem;
	}

	.header {
		align-items: center;
		display: flex;
	}

	.details {
		flex: 1 1 auto;
		margin-left: 0.5rem;
	}

	h4 {
		margin: 0;
	}

	time {
		color: #777;
		font-size: 0.75rem;
		text-decoration: underline;
	}

	.body {
		margin-top: 0.5rem;
	}

	.body :global(p) {
		margin: 0;
	}
</style>
