<script module>
	import Child from './Child.svelte';
	export let route = $state({});
</script>

<button onclick={() => route.reject()}>reject</button>

<svelte:boundary>
	<Child />

	{#snippet pending()}
		<p>pending</p>
	{/snippet}

	{#snippet failed()}
		<p>failed</p>
	{/snippet}
</svelte:boundary>
