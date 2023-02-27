<script>
	export let things;
</script>

<div>
	{#each things as thing}
		<slot name="item" {thing}/>
	{/each}
</div>