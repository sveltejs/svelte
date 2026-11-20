<script>
	let { items } = $props();
</script>

{#each items as item}<p>{item}</p>{:else} {/each}

{#each items as item (item)}<p>{item}</p>{:else}<!-- preserved -->{/each}
