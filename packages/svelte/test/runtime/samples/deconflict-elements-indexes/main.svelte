<script>
	export let tagList = ['one'];

	function remove(index) {
		// ...
	}
</script>

<div>
	{#each tagList as tag, i}
		<i on:click='{() => remove(i)}'>
			{tag}
		</i>
	{/each}
</div>