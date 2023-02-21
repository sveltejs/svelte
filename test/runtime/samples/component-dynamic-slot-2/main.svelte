<script>
	import Nested from './Nested.svelte';
	export let value;
	export let condition = true;
</script>

<Nested>
	{#if value === 1}
		<svelte:fragment slot="a">A</svelte:fragment>
	{:else if value === 2}
		<svelte:fragment slot="a">2A</svelte:fragment>
		<svelte:fragment slot="b">2B</svelte:fragment>
		<svelte:fragment slot="c">2C</svelte:fragment>
	{:else if value === 3}
		<svelte:fragment slot="a">3A</svelte:fragment>
		{#if condition}
			<svelte:fragment slot="b">3B</svelte:fragment>
		{:else}
			<svelte:fragment slot="d">3D</svelte:fragment>
		{/if}
	{:else}
		{#if condition}
			<svelte:fragment slot="a">4A</svelte:fragment>
			<svelte:fragment slot="b">4B</svelte:fragment>
		{:else}
			{#if value === 5}
				<svelte:fragment slot="a">5A</svelte:fragment>
			{/if}
		{/if}
	{/if}
</Nested>
