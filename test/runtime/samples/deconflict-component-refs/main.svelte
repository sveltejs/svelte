<script>
	export let components;
	let name;
</script>

<ul>
	{#each components as component}
		<li>
			{#if component.edit}
				<input bind:this={name} bind:value={component.name} />
			{:else}
				{component.name}
			{/if}
		</li>
	{/each}
</ul>