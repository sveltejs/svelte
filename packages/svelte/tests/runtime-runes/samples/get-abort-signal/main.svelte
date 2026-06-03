<script>
	import { getAbortSignal } from 'svelte';

	let count = $state(0);

	let delayed_count = $derived.by(async () => {
		let c = count;

		const signal = getAbortSignal();

		await new Promise((f) => setTimeout(f));

		if (signal.aborted) {
			console.log('aborted', signal.reason.name, signal.reason.message);
		}

		return c;
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
