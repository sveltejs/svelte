<script lang="ts">
	let { enable }: { enable: () => void } = $props();

	let count = $state(0);
	let show = $state(false);

	let resolve: (value: string) => void = () => {};
	const promise = new Promise<string>((fulfil) => (resolve = fulfil));

	$effect(() => {
		if (count === 1) {
			// async mode turns on while a batch that was created without it is being flushed
			enable();
			show = true;
		}
	});
</script>

<button onclick={() => count++}>count</button>
<button onclick={() => resolve('resolved')}>resolve</button>

<output>
	<p>{count}</p>

	<svelte:boundary>
		{#if show}
			<p>{await promise} {count}</p>
		{/if}
	</svelte:boundary>
</output>
