<script>
	let object = $state({ id: 1 });

	/** @type {Array<() => void>} */
	let deferreds = [];

	/** @param {any} value */
	function push(value) {
		const d = Promise.withResolvers();
		deferreds.push(() => d.resolve(value));
		return d.promise;
	}
</script>

<button onclick={() => (object = null)}>clear</button>
<button onclick={() => deferreds.shift()?.()}>shift</button>

<svelte:boundary>
	<p>{await push(object?.id ?? 'none')}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>

{#if object}
	<div {@attach () => () => console.log(`detach: ${object.id}`)}></div>
{/if}
