<script>
	let { promise } = $props();
</script>


	{#if promise}
		{#await promise}
			{console.log("await")}
		{:then r}
			{console.log("then")}
		{:catch err}
			{console.log("catch")}
		{/await}
	{/if}


