<script>
	const iconNode = [["path", { "d": "M21 12a9 9 0 1 1-6.219-8.56" }]];
</script>

<svg>
	{#each iconNode as [tag, attrs]}
		<svelte:element this={tag} {...attrs}/>
	{/each}
</svg>

<svg>
	<svelte:element this="path">
		<foreignObject>
			<svelte:element this="span">ok</svelte:element>
		</foreignObject>
		<foreignObject>
			{#if true}
				<svelte:element this="span">ok</svelte:element>
			{/if}
		</foreignObject>
	</svelte:element>
</svg>
