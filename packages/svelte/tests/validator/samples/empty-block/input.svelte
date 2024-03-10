<script>
	let things = [];
</script>

<!-- ok (zero elements very likely means someone's in the middle of typing) -->
{#each things as thing}{/each}
{#if true}{/if}
{#key things}x{/key}
{#await promise}{things}
{/await}

<!-- invalid -->
{#each things as thing}

{/each}
{#if true} {/if}
{#key things} {/key}
{#await promise} {/await}
