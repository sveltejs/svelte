<script>
	let caption = 'a foo in its natural habitat';
</script>

<figure>
	<img src='foo.jpg' alt='a picture of a foo'>
	{#if caption}
		<figcaption>{caption}</figcaption>
	{/if}
</figure>
