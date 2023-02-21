<script>
	import Nested from './Nested.svelte';
	export let condition;
</script>

<Nested>
	{#if condition}
		<svelte:fragment slot="a">
			<div>test</div>
		</svelte:fragment>
	{:else}
		<svelte:fragment slot="a">
			<div>test</div>
		</svelte:fragment>
	{/if}

	{#if condition}
		<svelte:fragment slot="b">
			<div>test</div>
		</svelte:fragment>
	{:else if condition}
		<svelte:fragment slot="b">
			<div>test</div>
		</svelte:fragment>
	{/if}

	{#if condition}
		<svelte:fragment slot="c">
			<div>test</div>
		</svelte:fragment>
	{:else}
		{#if condition}
			<svelte:fragment slot="c">
				<div>test</div>
			</svelte:fragment>
		{:else}
			<svelte:fragment slot="c">
				<div>test</div>
			</svelte:fragment>
		{/if}
	{/if}

	{#if condition}
		<svelte:fragment slot="d">
			<div>test</div>
		</svelte:fragment>
	{:else}
		{#if condition}
			{#if condition}
				{#if condition}
					<svelte:fragment slot="d">
						<div>test</div>
					</svelte:fragment>
				{/if}
			{/if}
		{:else}
			{#if condition}
				{#if condition}
					<svelte:fragment slot="d">
						<div>test</div>
					</svelte:fragment>
				{/if}
			{/if}
		{/if}
	{/if}
</Nested>