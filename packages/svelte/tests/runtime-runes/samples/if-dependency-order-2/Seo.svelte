<script>
	let { post } = $props();
</script>

<svelte:head>
	<title>{post.title}</title>
</svelte:head>

<p>{post.title}</p>
