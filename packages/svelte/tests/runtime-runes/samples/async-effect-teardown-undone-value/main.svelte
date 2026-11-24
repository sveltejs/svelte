<script>
	import Child from './Child.svelte';

	let x = $state(0);
	let show = $state(false);

	/** @type {Array<() => void>} */
	let deferreds = [];

	/** @param {number} value */
	function push(value) {
		const d = Promise.withResolvers();
		deferreds.push(() => d.resolve(value));
		return d.promise;
	}
</script>

<button onclick={() => x++}>increment</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => deferreds.shift()?.()}>shift</button>

<svelte:boundary>
	<p>{await push(x)}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>

{#if show && x === 0}
	<Child getX={() => x} />
{/if}
