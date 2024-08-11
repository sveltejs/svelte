<script>
	export let array = ['a'];
	export let visible = true;

	function slide(_) {
		return {
			duration: 100,
			css: (t) => `opacity: ${t}`
		};
	}
</script>

{#if visible}
	{#each array as item}
		<div transition:slide|global>{item}</div>
	{/each}
{/if}

{#if !visible}{:else}
	{#each array as item}
		<div transition:slide|global>{item}</div>
	{/each}
{/if}
