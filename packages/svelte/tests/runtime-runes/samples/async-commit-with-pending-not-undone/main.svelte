<script>
	let a = $state(0);
	let show = $state(false);

	let deferreds = [];

	function push() {
		console.log('push');
		const d = Promise.withResolvers();
		deferreds.push(d);
		return d.promise;
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => deferreds.shift()?.resolve('done')}>shift</button>

<p>a: {a}</p>

{#if show && a >= 0}
	<svelte:boundary>
		<p>content: {await push()}</p>

		{#snippet pending()}
			<p>loading...</p>
		{/snippet}
	</svelte:boundary>
{/if}
