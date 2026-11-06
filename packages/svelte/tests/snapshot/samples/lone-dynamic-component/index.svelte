<script>
	import A from './A.svelte';

	let Component = $state(A);
	let items = $state([1, 2, 3]);
	let show = $state(true);
</script>

<!-- sole child of the block, so it renders into the block's anchor -->
{#if show}<Component />{/if}

<!-- not the sole child, so it still needs an anchor of its own -->
{#if show}<Component /><span></span>{/if}

<!-- `{#each}` items are reordered by their node boundary, and a deferred branch is
     committed at the item's own anchor, so the anchor stays -->
{#each items as item}<Component {item} />{/each}
