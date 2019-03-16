<script>
	export let file;
</script>

<article class='file {file.type}'>
	<span class='name'>{file.name}</span>

	{#if file.type === 'folder'}
		<ul>
			{#each file.children as child}
				<li><svelte:self file='{child}'/></li>
			{/each}
		</ul>
	{/if}
</article>