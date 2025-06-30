<script>
	import { getAbortSignal } from 'svelte';

	let count = $state(0);

	let delayed_count = $derived.by(async () => {
		const response = await fetch(`data:text/plain;charset=utf-8,${count}`, {
			signal: getAbortSignal()
		});

		return await response.json();
	});
</script>

<button onclick={async () => {
	count += 1;
	await Promise.resolve();
	count += 1;
}}>increment</button>

{#await delayed_count}
	<p>loading...</p>
{:then count}
	<p>{count}</p>
{:catch error}
	{console.log('this should never be rendered')}
{/await}
