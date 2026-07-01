<script>
	let portalKey = $state('a');
	let outletKey = $state('b');
</script>

<button onclick={() => portalKey = portalKey === 'a' ? 'b' : 'a'}>toggle portalKey</button>
<button onclick={() => outletKey = outletKey === 'a' ? 'b' : 'a'}>toggle outletKey</button>

{#portal portalKey}
	hi
{/portal}

{@portal outletKey}
