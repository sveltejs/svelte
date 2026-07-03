<script>
	let portal_key = $state('a');

	let queued = [];

	function push(v) {
		return new Promise((resolve) => {
			queued.push(() => resolve(v));
		});
	}
</script>

<button onclick={() => portal_key = portal_key === 'a' ? 'b' : 'a'}>toggle</button>
<button onclick={() => queued.shift()?.()}>resolve</button>

{@portal 'b'}

{portal_key}
{#portal portal_key}
	{await push('b')}
{/portal}
