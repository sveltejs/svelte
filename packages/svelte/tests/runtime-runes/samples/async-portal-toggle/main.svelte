<script>
	let portalKey = $state('a');
	let outletKey = $state('a');

	let queued = [];
	let first = true;

	function push(v) {
		if (first) {
			first = false;
			return v;
		}

		return new Promise((resolve) => {
			queued.push(() => resolve(v));
		});
	}
</script>

<button onclick={() => portalKey = portalKey === 'a' ? 'b' : 'a'}>toggle portalKey</button>
<button onclick={() => outletKey = outletKey === 'a' ? 'b' : 'a'}>toggle outletKey</button>
<button onclick={() => queued.shift()?.()}>shift</button>
<button onclick={() => queued.pop()?.()}>pop</button>

{await push(portalKey + outletKey)}

{#if portalKey === 'a'}
	{#portal portalKey}
		hi
	{/portal}
{/if}

{#if outletKey === 'a'}
	{@portal outletKey}
{/if}
