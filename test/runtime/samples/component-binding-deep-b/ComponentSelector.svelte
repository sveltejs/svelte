<select bind:value={selectedComponent}>
	{#each components as component}
		<option value='{component}'>{component.name}.html</option>
	{/each}
</select>