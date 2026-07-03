<script>
	let show = $state(false);

	let queued = [];

	function push(v) {
		return new Promise((resolve) => {
			queued.push(() => resolve(v));
		});
	}
</script>

<button onclick={() => show = true}>show</button>
<button onclick={() => queued.shift()?.()}>resolve</button>

{@portal 'target'}

{show}
{#if show}
	{#portal 'target'}
		<h1>static</h1>
		{await push('async')}
	{/portal}
{/if}
