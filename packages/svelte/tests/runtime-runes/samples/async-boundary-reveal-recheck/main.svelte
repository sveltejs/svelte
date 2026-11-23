<script>
	import Child from './Child.svelte';

	let items = $state([false]);
	let force = $state(0);
	let check = () => false;
	const deferred = Promise.withResolvers();
</script>

<button
	onclick={() => {
		force++;
		items = [true];
	}}>change</button
>
<button onclick={() => deferred.resolve('ready')}>resolve</button>

<svelte:boundary>
	{#if force === 0 || check()}
		<p>{await deferred.promise}</p>
	{:else}
		<p>hidden</p>
	{/if}

	{#snippet pending()}
		<p>loading</p>
	{/snippet}
</svelte:boundary>

{#each items as item}
	<Child value={item} register={(fn) => (check = fn)} />
{/each}
