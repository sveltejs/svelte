<script>
	import Child from './Child.svelte';

	let show = $state(false);
	let x = $state(0);
	let y = $state(0);

	/** @type {Array<() => void>} */
	const queue = [];

	/**
	 * @template T
	 * @param {T} value
	 * @returns {Promise<T>}
	 */
	function delay(value) {
		return new Promise((resolve) => queue.push(() => resolve(value)));
	}
</script>

<button onclick={() => (show = true)}>show</button>
<button onclick={() => (x = 2)}>x = 2</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => queue.pop()?.()}>pop</button>
<button onclick={() => y++}>y++</button>

<svelte:boundary>
	{#if show}
		<Child set={(/** @type {number} */ v) => (x = v)} wait={() => delay('child')} />
	{/if}
	<p>{await delay(x)}</p>
	<span>{x}|{y}</span>

	{#snippet pending()}{/snippet}
</svelte:boundary>
