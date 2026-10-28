<script>
	import Child from './Child.svelte';

	let x = $state(0);
	let double = $derived(x * 2);
	let show = $state(true);

	/** @type {Array<() => void>} */
	const deferreds = [];

	/** @param {number} value */
	function push(value) {
		const deferred = Promise.withResolvers();
		deferreds.push(() => deferred.resolve(value));
		return deferred.promise;
	}
</script>

<button onclick={() => {
	x = 1;
	console.log(`latest: ${double}`);
}}>start</button>
<button onclick={() => (show = false)}>hide</button>
<button onclick={() => deferreds.shift()?.()}>resolve</button>

<svelte:boundary>
	<p>{await push(x)}</p>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>

{#if show}
	<Child getX={() => x} getDouble={() => double} />
{/if}
