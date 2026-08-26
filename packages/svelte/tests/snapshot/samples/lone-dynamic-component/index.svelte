<script>
	import A from './A.svelte';

	let Component = $state(A);
	let items = $state([1, 2, 3]);
</script>

<!-- sole child of the block, so no anchor comment is needed for it -->
{#each items as item}<Component {item} />{/each}

<!-- not the sole child, so it still gets one -->
{#each items as item}<Component {item} /><span></span>{/each}
