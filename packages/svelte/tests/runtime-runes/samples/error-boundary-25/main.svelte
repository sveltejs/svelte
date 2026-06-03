<script>
	import Child from './Child.svelte';

	let exception = $state();
	const onerror = (e) => {
		exception = e;
	};
</script>

{#if !exception}
	<p>condition is {String(!exception)}</p>
	<svelte:boundary {onerror}>
		<Child />
	</svelte:boundary>
{/if}

{#if exception}
	<p>caught error: {exception}</p>
{/if}
