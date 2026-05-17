<script>
	let iconData = $state({ paths: [{ d: 'M0 0' }] });
</script>

<svg>
	{#if iconData}
		{#if iconData.paths}
			{#each iconData.paths as path}
				<path {...path} />
			{/each}
		{/if}
	{/if}
</svg>
