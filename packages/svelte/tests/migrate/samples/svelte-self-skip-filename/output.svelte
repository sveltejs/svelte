<script>
	/** @type {Record<string, any>} */
	let { ...props } = $props();
</script>

{#if false}
	<!-- @migration-task: migrate this by hand or call the migrate function with the filename of this file -->
	<svelte:self />
	<!-- @migration-task: migrate this by hand or call the migrate function with the filename of this file -->
	<svelte:self with_attributes/>
	<!-- @migration-task: migrate this by hand or call the migrate function with the filename of this file -->
	<svelte:self count={count+1}/>
	<!-- @migration-task: migrate this by hand or call the migrate function with the filename of this file -->
	<svelte:self>
		child
	</svelte:self>
	<!-- @migration-task: migrate this by hand or call the migrate function with the filename of this file -->
	<svelte:self count={count+1}>
		child
	</svelte:self>
	<!-- @migration-task: migrate this by hand or call the migrate function with the filename of this file -->
	<svelte:self count={props.count}     >
		child
	</svelte:self>
	<!-- @migration-task: migrate this by hand or call the migrate function with the filename of this file -->
	<svelte:self></svelte:self>
{/if}