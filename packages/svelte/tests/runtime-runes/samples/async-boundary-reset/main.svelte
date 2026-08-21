<script>
	import Test from './Test.svelte';
</script>

<svelte:boundary>
	<Test />

	{#snippet pending()}pending{/snippet}
	{#snippet failed(_, reset)}
		<button onclick={reset}>reset</button>
	{/snippet}
</svelte:boundary>
