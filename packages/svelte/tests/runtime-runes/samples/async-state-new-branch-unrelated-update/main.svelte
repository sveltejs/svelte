<script>
	let show = $state(false);
	let gate = $state(1);

	const deferred = [];

	function load() {
		console.log('load');
		return new Promise((resolve) => deferred.push(() => resolve('loaded')));
	}
</script>

<button onclick={() => (show = true)}>show</button>
<button onclick={() => gate++}>gate</button>
<button onclick={() => deferred.shift()?.()}>resolve</button>

{#if show && gate > 0}
	<p>{await load()}</p>
{/if}
