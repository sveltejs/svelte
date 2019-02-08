<select bind:value={selectedComponent}>
	{#each components as component}
		<option value='{component}'>{component.name}.svelte</option>
	{/each}
</select>