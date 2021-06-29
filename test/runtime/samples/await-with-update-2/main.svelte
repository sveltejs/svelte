<script>
	import Component from './Component.svelte';
	export let thePromise;
	export let count;
	export { Component }
</script>

<div>
	{#await thePromise}
		<p>loading...</p>
	{:then { value: theValue, Component }}
		Resolved: <svelte:component this={Component} {count} value={theValue} />
	{:catch { value: theError, Component } }
		Rejected: <svelte:component this={Component} {count} value={theError} />
	{/await}
</div>