<script>
	export let things;
</script>

<div>
	{#each things as thing}
		<slot name="foo" {thing}/>
	{/each}
</div>
