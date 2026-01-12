<script>
	import { fork } from 'svelte';

	let condition = $state(false);
	let checked = $state(false);

	const d = $derived({ checked });
</script>

<button onclick={() => {
	fork(() => {
		condition = true;
	}).commit();
}}>fork</button>

{#if condition}
	<!-- in dev, snippet arguments are read eagerly, outside a tracking context -->
	<!-- this test checks that doing so doesn't prevent the derived from connecting -->
	{#snippet foo({ checked })}
		{checked}
	{/snippet}

	<button onclick={() => (checked = !checked)}>
		{@render foo(d)}
	</button>
{/if}
