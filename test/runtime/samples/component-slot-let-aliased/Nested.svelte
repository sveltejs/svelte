<script>
	export let things;
</script>

<div>
	{#each things as thing}
		<slot {thing}/>
	{/each}
</div>