<script lang="ts">
	import { tick, untrack } from 'svelte';

	let step = $state('start');
	const { promise: pending, resolve } = Promise.withResolvers<string>();

	function resource(request: () => Promise<string>) {
		const next = $derived(request());
		let current = $state.raw(untrack(() => next));

		$effect(() => {
			if (current !== next) current = next;
		});

		return () => current;
	}

	async function run() {
		step = 'pending';
		await tick();
		step = 'back';
		await tick();
		step = 'other';
		await tick();
		step = 'done';
		resolve('other');
	}
</script>

<button onclick={run}>Run</button>

<output>
	<svelte:boundary>
		{#if step === 'pending' || step === 'other'}
			{const value = $derived(await (step === 'pending' ? pending : 'other'))}
			<p>{value}</p>
		{:else}
			{const key = $derived(step)}
			{const read = resource(() => Promise.resolve(key))}

			<svelte:boundary>
				<p>{await read()}</p>
				{#snippet pending()}<p>loading</p>{/snippet}
			</svelte:boundary>
		{/if}

		{#snippet failed(error)}<p>{error.message}</p>{/snippet}
	</svelte:boundary>
</output>
