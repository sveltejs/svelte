<script>
	let portalKey = $state('a');
	let outletKey = $state('a');
</script>

<button onclick={() => portalKey = portalKey === 'a' ? 'b' : 'a'}>toggle portalKey</button>
<button onclick={() => outletKey = outletKey === 'a' ? 'b' : 'a'}>toggle outletKey</button>

{#if portalKey === 'a'}
	{#portal portalKey}
		hi
	{/portal}
{/if}

{#if outletKey === 'a'}
	{@portal outletKey}
{/if}
