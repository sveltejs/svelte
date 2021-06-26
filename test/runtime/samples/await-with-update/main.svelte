<script>
	import Component from './Component.svelte';
	export let thePromise;
	export let count;
	export { Component }
</script>

<div>
	{#await thePromise}
		<p>loading...</p>
	{:then theValue}
		Resolved: <svelte:component this={theValue} {count} />
	{:catch theError}
		Rejected: <svelte:component this={theError} {count} />
	{/await}
</div>