{#if false}
	<svelte:self />
	<svelte:self with_attributes/>
	<svelte:self count={count+1}/>
	<svelte:self>
		child
	</svelte:self>
	<svelte:self count={count+1}>
		child
	</svelte:self>
	<svelte:self count={$$props.count}     >
		child
	</svelte:self>
	<svelte:self></svelte:self>
{/if}