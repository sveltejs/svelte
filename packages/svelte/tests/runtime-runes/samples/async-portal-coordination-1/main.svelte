<script>
	let outletKey = $state('a');

	let queued = [];

	function push(v) {
		return new Promise((resolve) => {
			queued.push(() => resolve(v));
		});
	}
</script>

<button onclick={() => outletKey = outletKey === 'a' ? 'b' : 'a'}>toggle</button>
<button onclick={() => queued.shift()?.()}>resolve</button>

{#portal 'b'}
	{await push('b')}
{/portal}

{outletKey}
{#if outletKey === 'b'}
	{@portal outletKey}
{/if}
