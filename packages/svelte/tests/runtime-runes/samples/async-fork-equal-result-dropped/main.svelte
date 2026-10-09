<script>
	import { fork } from 'svelte';

	let a = $state(0);
	let b = $state(0);

	/** @type {ReturnType<typeof fork> | null} */
	let f = null;

	/** @type {Array<() => void>} */
	const deferred = [];

	/** @param {number} value */
	function delay(value) {
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

<button onclick={() => (f = fork(() => { a = 1; b = 1; }))}>fork</button>
<button onclick={() => (a = 2)}>a = 2</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
<button onclick={() => f?.commit()}>commit</button>

<svelte:boundary>
	<p>{await delay(a)}</p>
	<span>{a}|{b}</span>
	{#snippet pending()}{/snippet}
</svelte:boundary>
