<script>
	export let array = ['a'];
	export let visible = true;

	function slide(_, params) {
		return params;
	}
</script>

{#if visible}
	{#each array as item}
		<div transition:slide={{duration:100}}>{item}</div>
	{/each}
{/if}

{#if !visible}
{:else}
	{#each array as item}
		<div transition:slide={{duration:100}}>{item}</div>
	{/each}
{/if}