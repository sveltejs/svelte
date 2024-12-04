<script>
	let { promise } = $props();
</script>


	{#if promise}
		{#await promise}
			{console.log("await")}
		{:then r}
			{console.log("then:"+r)}
		{:catch err}
			{console.log("catch:"+err)}
		{/await}
	{/if}


