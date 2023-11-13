<script>
	export let thePromise;
</script>

{#await thePromise then}
	<p>the promise is resolved</p>
{:catch theError}
	<p>oh no! {theError.message}</p>
{/await}

<br />

{#await thePromise then}
	<p>the promise is resolved</p>
{/await}

<br />

{#await thePromise}
	<p>the promise is pending</p>
{:then}
	<p>the promise is resolved</p>
{/await}