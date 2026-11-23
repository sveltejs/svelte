<script>
	import "./Inner.svelte"
	let count = 1;
</script>

<button on:click={() => count++}>inc</button>
<!-- updating value prop will cause a flushSync -->
<my-inner value={count}></my-inner>
<!-- updating count will cause an internal_set -->
{#each [count] as row}
	{row}
{/each}
