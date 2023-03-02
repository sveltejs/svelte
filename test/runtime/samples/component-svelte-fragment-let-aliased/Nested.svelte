<script>
	export let things;
</script>

<div>
	{#each things as thing}
		<slot name="main" {thing}/>
	{/each}
</div>