<script>
	import Child from './Child.svelte';

	let other = $state(0);
	let show = $state(true);
	const deferred = Promise.withResolvers();
</script>

<button onclick={() => deferred.resolve('ready')}>resolve</button>
<button onclick={() => other++}>update</button>
<p>{other}</p>

{#if show}
	<svelte:boundary>
		<Child promise={deferred.promise} />

		{#snippet pending()}
			<p>pending</p>
		{/snippet}
	</svelte:boundary>
{/if}
