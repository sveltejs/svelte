<script>
	export let thePromise;
</script>

{#await thePromise catch}
	<p>oh no! Something broke!</p>
{/await}

<br />

{#await thePromise}
	<p>the promise is pending</p>
{:catch}
	<p>oh no! Something broke!</p>
{/await}
